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
import { Document } from "@langchain/core/documents";
import type {
  Node,
  Relationship,
} from "node_modules/@langchain/community/dist/graphs/graph_document";
import { dataDisambiguation } from "@/app/_utils/kg/data-disambiguation";

const pdfSchema = z.object({
  fileUrl: z.string(),
  mode: z.string().optional(),
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

const graphExtractionWithLangChain = async (localFilePath: string) => {
  const llm = new ChatOpenAI({ temperature: 0.01, model: "gpt-4o-mini" });
  const llmTransformer = new LLMGraphTransformer({ llm });

  const loader = new PDFLoader(localFilePath);
  const rawDocs = await loader.load();

  const textSplitter = new TokenTextSplitter({
    chunkSize: 512,
    chunkOverlap: 24,
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

  const llmGraphDocuments =
    await llmTransformer.convertToGraphDocuments(documents);

  const nodes: Node[] = [];
  const relationships: Relationship[] = [];
  llmGraphDocuments.map((graphDocument) => {
    nodes.push(...graphDocument.nodes);
    relationships.push(...graphDocument.relationships);
  });
  const newNodes = nodes.map((node, index) => {
    return {
      id: index,
      name: node.id as string,
      label: node.type,
      properties: {},
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
        properties: {},
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
    temperature: 0.01,
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
  extractKG: publicProcedure.input(pdfSchema).mutation(async ({ input }) => {
    const { fileUrl, mode } = input;

    const fileResponse = await fetch(fileUrl);
    const fileBuffer = await fileResponse.arrayBuffer();
    const localFilePath = writeFile(
      Buffer.from(fileBuffer).toString("base64"),
      "input.pdf",
    );

    // SchemaExample: Nodes: [Person {age: integer, name: string}] Relationships: [Person, roommate, Person]
    // const schema = `
    // Nodes: [Artist {name: string, birthYear: integer}], [Museum {name: string, builtAt: integer}], [Curator {name: string, birthYear: integer}], [Exhibition {title: string, heldAt: integer}], [Critic {name: string, birthYear: integer}]
    // Relationships: [Artist, join, Exhibition], [Curator, direction, Exhibition], [Museum, host, Exhibition], [Critic, mention ,Artist]
    // `;
    const schema = "";

    try {
      const nodesAndRelationships =
        mode === "langChain"
          ? await graphExtractionWithLangChain(localFilePath)
          : await graphExtractionWithAssistantsAPI(localFilePath, schema);

      exportJson(
        JSON.stringify(nodesAndRelationships),
        "node-relationship.json",
      );

      const disambiguatedNodesAndRelationships = dataDisambiguation(
        nodesAndRelationships,
      );

      exportJson(
        JSON.stringify(disambiguatedNodesAndRelationships),
        "disambiguated-node-relationship.json",
      );

      return {
        data: { graph: disambiguatedNodesAndRelationships },
      };
    } catch (error) {
      return {
        data: { graph: null, error: "グラフ抽出エラー" },
      };
    }
  }),
});
