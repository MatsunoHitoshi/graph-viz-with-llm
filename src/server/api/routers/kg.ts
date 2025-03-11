import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import OpenAI from "openai";
import { exportJson, writeFile } from "@/app/_utils/sys/file";
import fs from "fs";
import {
  createExtraNode,
  getNodesAndRelationshipsFromResult,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";
import type {
  NodeType,
  RelationshipType,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";
import { ChatOpenAI } from "@langchain/openai";
import { LLMGraphTransformer } from "@langchain/community/experimental/graph_transformers/llm";
import { TokenTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "@langchain/core/documents";
import type {
  Node,
  Relationship,
} from "node_modules/@langchain/community/dist/graphs/graph_document";
import {
  dataDisambiguation,
  fuseGraphs,
} from "@/app/_utils/kg/data-disambiguation";
import { env } from "@/env";
// import type { Prisma } from "@prisma/client";
// import { GraphDataStatus } from "@prisma/client";
// import { stripGraphData } from "@/app/_utils/kg/data-strip";

const ExtractInputSchema = z.object({
  fileUrl: z.string().url(),
  extractMode: z.string().optional(),
  isPlaneTextMode: z.boolean(),
});

export type GraphDocument = {
  nodes: NodeType[];
  relationships: RelationshipType[];
};

export type NodeSchema = {
  entity: string;
  type: string;
};

const generateSystemMessageWithSchema = (schema: string) => {
  return `
Provide a set of Nodes in the form [ENTITY, TYPE, PROPERTIES] and a set of relationships in the form [ENTITY1, RELATIONSHIP, ENTITY2, PROPERTIES]. 
Pay attention to the type of the properties, if you can't find data for a property set it to null. Don't make anything up and don't add any extra data. If you can't find any data for a node or relationship don't add it.
Only add nodes and relationships that are part of the schema. If you don't get any relationships in the schema only add nodes.
Do not include extra text in your response, but return only the data.

# Response format
Schema: Nodes: [Person {age: integer, name: string}] Relationships: [Person, roommate, Person]
Alice is 25 years old and Bob is her roommate.
Nodes: [["Alice", "Person", {"age": 25, "name": "Alice}], ["Bob", "Person", {"name": "Bob"}]]
Relationships: [["Alice", "roommate", "Bob"]]

#Schema
${schema}`;
};

const generateSystemMessage = () => {
  return `
Provide a set of Nodes in the form [ENTITY_ID, TYPE, PROPERTIES] and a set of Relationships in the form [ENTITY_ID_1, RELATIONSHIP, ENTITY_ID_2, PROPERTIES] from attached data.
Attempt to extract as many Nodes and Relationships as you can.
It is important that the ENTITY_ID_1 and ENTITY_ID_2 exists as Nodes with a matching ENTITY_ID.
If you can't pair a Relationship with a pair of Nodes don't add it.
Don't make anything up and don't add any extra data.
When you find a Node or Relationship you want to add try to create a generic TYPE for it that  describes the entity you can also think of it as a label.
Nodes that are targets of Edges must also be defined as a Node.
Do not include extra text in your response, but return only the data.

# Response format
Data: Alice lawyer and is 25 years old and Bob is her roommate since 2001. Bob works as a journalist. Alice owns a the webpage www.alice.com and Bob owns the webpage www.bob.com.
Nodes: ["alice", "Person", {"age": 25, "occupation": "lawyer", "name":"Alice"}], ["bob", "Person", {"occupation": "journalist", "name": "Bob"}], ["alice.com", "Webpage", {"url": "www.alice.com"}], ["bob.com", "Webpage", {"url": "www.bob.com"}]
Relationships: ["alice", "roommate", "bob", {"start": 2021}], ["alice", "owns", "alice.com", {}], ["bob", "owns", "bob.com", {}]
    `;
};

const graphExtractionWithLangChain = async (
  localFilePath: string,
  isPlaneTextMode: boolean,
) => {
  const llm = new ChatOpenAI({ temperature: 0.8, model: "gpt-4o" });
  const llmTransformer = new LLMGraphTransformer({ llm });

  const loader = isPlaneTextMode
    ? new TextLoader(localFilePath)
    : new PDFLoader(localFilePath);
  const rawDocs = await loader.load();

  const textSplitter = new TokenTextSplitter({
    chunkSize: 1024,
    chunkOverlap: 32,
  });

  const documents: Document[] = [];
  await Promise.all(
    rawDocs.map(async (rowDoc) => {
      const chunks = await textSplitter.splitText(rowDoc.pageContent);
      const processedDocs = chunks.map(
        (chunk, index) =>
          new Document({
            pageContent: chunk,
            metadata: {
              a: index + 1,
              ...rowDoc.metadata,
            },
          }),
      );
      documents.push(...processedDocs);
    }),
  );

  console.log("documents: ", documents);

  const llmGraphDocuments =
    await llmTransformer.convertToGraphDocuments(documents);

  const nodes: Node[] = [];
  const relationships: Relationship[] = [];
  llmGraphDocuments.map((graphDocument) => {
    console.log("nodes from llm: ", graphDocument.nodes);
    console.log("links from llm: ", graphDocument.relationships);
    nodes.push(...graphDocument.nodes);
    relationships.push(...graphDocument.relationships);
  });
  const newNodes = nodes.map((node, index) => {
    console.log("id: ", node.id);
    console.log("type: ", node.type);
    console.log("lc_attributes: ", node.lc_attributes);
    console.log("lc_aliases: ", node.lc_aliases);
    console.log("lc_kwargs: ", node.lc_kwargs);
    console.log("lc_namespace: ", node.lc_namespace);
    console.log("lc_secrets: ", node.lc_secrets);
    console.log("properties: ", node.properties);
    console.log("---");
    return {
      id: index,
      name: node.id as string,
      label: node.type,
      properties: node.properties,
    };
  });
  const nodesAndRelationships = {
    nodes: newNodes,
    relationships: relationships.map((relationship, index) => {
      const source =
        newNodes.find((newNode) => {
          return newNode.name === relationship.source.id;
        }) ?? createExtraNode(relationship.source.id as string, newNodes);
      const target =
        newNodes.find((newNode) => {
          return newNode.name === relationship.target.id;
        }) ?? createExtraNode(relationship.target.id as string, newNodes);
      return {
        id: index,
        sourceName: relationship.source.id as string,
        sourceId: source.id,
        type: relationship.type,
        targetName: relationship.target.id as string,
        targetId: target.id,
        properties: relationship.properties,
      };
    }),
  };

  return nodesAndRelationships;
};

const graphExtractionWithAssistantsAPI = async (
  localFilePath: string,
  schema: string,
) => {
  const openai = new OpenAI();
  const assistant = await openai.beta.assistants.create({
    name: "Graph Database Assistant",
    instructions:
      "You are a top-tier algorithm designed for extracting information in structured formats to build a knowledge graph. Your task is to identify the Nodes and Relations requested with the user prompt from a given file.",
    model: "gpt-4o-mini",
    tools: [{ type: "file_search" }],
    temperature: 0.0,
  });

  const inputFile = await openai.files.create({
    file: fs.createReadStream(localFilePath),
    purpose: "assistants",
  });

  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: schema
          ? generateSystemMessageWithSchema(schema)
          : generateSystemMessage(),
        attachments: [
          { file_id: inputFile.id, tools: [{ type: "file_search" }] },
        ],
      },
    ],
  });
  console.log("thread's vector store: ", thread.tool_resources?.file_search);
  console.log(
    "prompt: ",
    schema ? generateSystemMessageWithSchema(schema) : generateSystemMessage(),
  );

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistant.id, // or "asst_jTbI1u826T6wkvn5A1zXoGSt"
  });

  const messages = await openai.beta.threads.messages.list(thread.id, {
    run_id: run.id,
  });
  const message = messages.data.pop()!;

  if (message?.content[0]!.type === "text") {
    const { text } = message.content[0];
    console.log(text.value);

    const nodesAndRelationships = getNodesAndRelationshipsFromResult(
      text.value,
    );
    return nodesAndRelationships;
  }
  return null;
};

export const kgRouter = createTRPCRouter({
  extractKG: publicProcedure
    .input(ExtractInputSchema)
    .mutation(async ({ input }) => {
      const { fileUrl, extractMode, isPlaneTextMode } = input;

      const fileResponse = await fetch(fileUrl);
      const fileBuffer = await fileResponse.arrayBuffer();
      const localFilePath = writeFile(
        Buffer.from(fileBuffer).toString("base64"),
        `input.${isPlaneTextMode ? "txt" : "pdf"}`,
      );

      // SchemaExample: Nodes: [Person {age: integer, name: string}] Relationships: [Person, roommate, Person]
      // const schema = `
      // Nodes: [Artist {name: string, birthYear: integer}], [Museum {name: string, builtAt: integer}], [Curator {name: string, birthYear: integer}], [Exhibition {title: string, heldAt: integer}], [Critic {name: string, birthYear: integer}]
      // Relationships: [Artist, join, Exhibition], [Curator, direction, Exhibition], [Museum, host, Exhibition], [Critic, mention ,Artist]
      // `;
      const schema = "";

      try {
        console.log("type: ", extractMode);
        const nodesAndRelationships =
          extractMode === "langChain"
            ? await graphExtractionWithLangChain(localFilePath, isPlaneTextMode)
            : await graphExtractionWithAssistantsAPI(localFilePath, schema);

        const disambiguatedNodesAndRelationships = dataDisambiguation(
          nodesAndRelationships,
        );

        if (env.NODE_ENV === "development") {
          exportJson(
            JSON.stringify(nodesAndRelationships),
            "node-relationship.json",
          );
          exportJson(
            JSON.stringify(disambiguatedNodesAndRelationships),
            "disambiguated-node-relationship.json",
          );
        }

        return {
          data: { graph: disambiguatedNodesAndRelationships },
        };
      } catch (error) {
        return {
          data: { graph: null, error: "グラフ抽出エラー" },
        };
      }
    }),

  // graphFusion: publicProcedure.mutation(async ({ ctx }) => {
  //   const updateFusionStatus = async (id: string, status: GraphDataStatus) => {
  //     await ctx.db.graphFusionQueue.update({
  //       where: { id: id },
  //       data: { status: status },
  //     });
  //   };
  //   const updateTopicGraph = async (
  //     id: string,
  //     graphData: Prisma.JsonObject,
  //   ) => {
  //     await ctx.db.topicSpace.update({
  //       where: { id: id },
  //       data: { graphData: stripGraphData(graphData as GraphDocument) },
  //     });
  //   };
  //   const createCompleteCheck = async (topicId: string) => {
  //     const topicSpace = await ctx.db.topicSpace.findFirst({
  //       where: { id: topicId, isDeleted: false },
  //       include: { graphFusionQueue: true },
  //     });
  //     if (
  //       !topicSpace?.graphFusionQueue.some((fusion) => {
  //         return (
  //           fusion.status ===
  //           (GraphDataStatus.QUEUED || GraphDataStatus.PROCESSING)
  //         );
  //       })
  //     ) {
  //       await ctx.db.topicSpace.update({
  //         where: { id: topicId },
  //         data: { graphDataStatus: GraphDataStatus.CREATED },
  //       });
  //     }
  //   };
  //   const fetchTopicSpace = async (id: string) => {
  //     const topicSpace = await ctx.db.topicSpace.findFirst({
  //       where: { id: id, isDeleted: false },
  //       include: { graphFusionQueue: true },
  //     });
  //     return topicSpace;
  //   };

  //   const graphFusionQueue = await ctx.db.graphFusionQueue.findMany({
  //     where: { status: GraphDataStatus.QUEUED },
  //     include: { topicSpace: true, additionalGraph: true },
  //     orderBy: { createdAt: "asc" },
  //   });

  //   for (const fusion of graphFusionQueue) {
  //     await updateFusionStatus(fusion.id, GraphDataStatus.PROCESSING);
  //     const topicSpace = await fetchTopicSpace(fusion.topicSpace.id);
  //     if (!topicSpace?.graphData) {
  //       await updateTopicGraph(
  //         fusion.topicSpace.id,
  //         fusion.additionalGraph.dataJson as GraphDocument,
  //       );
  //       await updateFusionStatus(fusion.id, GraphDataStatus.CREATED);
  //     } else {
  //       const graphData = await fuseGraphs(
  //         topicSpace.graphData as GraphDocument,
  //         fusion.additionalGraph.dataJson as GraphDocument,
  //       );
  //       if (!graphData) {
  //         await updateFusionStatus(fusion.id, GraphDataStatus.CREATION_FAILED);
  //       } else {
  //         await updateTopicGraph(fusion.topicSpace.id, graphData);
  //         await updateFusionStatus(fusion.id, GraphDataStatus.CREATED);
  //       }
  //     }

  //     await createCompleteCheck(fusion.topicSpace.id);
  //   }

  //   return {
  //     message: "complete",
  //     numberOfRecords: graphFusionQueue.length,
  //   };
  // }),
});
