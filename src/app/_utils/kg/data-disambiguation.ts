import type { GraphDocument } from "@/server/api/routers/kg";
import { type RelationshipType } from "./get-nodes-and-relationships-from-result";

const generateSystemMessageForNodes = () => {
  return `
Your task is to identify if there are duplicated nodes and if so merge them into one node. Only merge the nodes that refer to the same entity.
You will be given different datasets of nodes and some of these nodes may be duplicated or refer to the same entity. 
The datasets contains nodes in the form [ENTITY_ID, TYPE, PROPERTIES]. When you have completed your task please give me the 
resulting nodes in the same format. Only return the nodes and relationships no other text. If there is no duplicated nodes return the original nodes.
  `;
};

const mergeRelationships = (relationships: RelationshipType[]) => {
  const mergedRelationships = relationships.filter((relationship, index) => {
    return (
      index ===
      relationships.findIndex(
        (r) =>
          r.sourceId === relationship.sourceId &&
          r.targetId === relationship.targetId &&
          r.type === relationship.type,
      )
    );
  });
  return mergedRelationships;
};

const mergerGraphsWithDuplicatedNodeName = (
  sourceGraph: GraphDocument,
  targetGraph: GraphDocument,
) => {
  const duplicatedSourceNodes = sourceGraph.nodes.filter((sourceNode) => {
    return targetGraph.nodes.some((targetNode) => {
      return targetNode.name === sourceNode.name;
    });
  });
  console.log("duplicated: ", duplicatedSourceNodes);
  const filteredSourceNodes = sourceGraph.nodes.filter((sourceNode) => {
    return !targetGraph.nodes.some((targetNode) => {
      return targetNode.name === sourceNode.name;
    });
  });

  const newNodes = targetGraph.nodes;
  const newRelationships = targetGraph.relationships;
  const nodeIdRecords: { prevId: number; newId: number }[] = [];

  duplicatedSourceNodes.map((dNode) => {
    const prevId = dNode.id;
    const newId = newNodes.find((nn) => {
      return nn.name === dNode.name;
    })?.id;
    nodeIdRecords.push({ prevId: prevId, newId: newId ?? 0 });
  });
  filteredSourceNodes.map((fNode, index) => {
    const prevId = fNode.id;
    const newId = newNodes.length + index;
    nodeIdRecords.push({ prevId: prevId, newId: newId });
    newNodes.push({ ...fNode, id: newId });
  });
  sourceGraph.relationships.map((sRelationship, index) => {
    const newId = newRelationships.length + index;
    newRelationships.push({
      ...sRelationship,
      id: newId,
      sourceId:
        nodeIdRecords.find((rec) => {
          return rec.prevId === sRelationship.sourceId;
        })?.newId ?? 0,
      targetId:
        nodeIdRecords.find((rec) => {
          return rec.prevId === sRelationship.targetId;
        })?.newId ?? 0,
    });
  });

  return { nodes: newNodes, relationships: newRelationships };
};

const simpleMerge = (graphDocument: GraphDocument) => {
  const { nodes, relationships } = graphDocument;
  const mergedRelationships = mergeRelationships(relationships);
  const result = { nodes: nodes, relationships: mergedRelationships };
  return result;
};

export const dataDisambiguation = (graphDocument: GraphDocument | null) => {
  if (!graphDocument) return null;
  const disambiguatedGraph = simpleMerge(graphDocument);
  return disambiguatedGraph;
};

export const fuseGraphs = async (
  sourceGraph: GraphDocument,
  targetGraph: GraphDocument,
) => {
  const graph = mergerGraphsWithDuplicatedNodeName(sourceGraph, targetGraph);
  const mergedRelationships = mergeRelationships(graph.relationships);

  return { nodes: graph.nodes, relationships: mergedRelationships };
  // const openai = new OpenAI();
  // const assistant = await openai.beta.assistants.create({
  //   name: "Graph Database Assistant",
  //   instructions:
  //     "You are a top-tier algorithm designed for extracting information in structured formats to build a knowledge graph. Your task is to identify the Nodes and Relations requested with the user prompt from a given file.",
  //   model: "gpt-4o",
  //   temperature: 0.0,
  // });

  // const thread = await openai.beta.threads.create({
  //   messages: [
  //     {
  //       role: "user",
  //       content: "prompt",
  //     },
  //   ],
  // });

  // const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
  //   assistant_id: assistant.id,
  // });

  // const messages = await openai.beta.threads.messages.list(thread.id, {
  //   run_id: run.id,
  // });
  // const message = messages.data.pop()!;

  // if (message?.content[0]!.type === "text") {
  //   const { text } = message.content[0];
  //   console.log(text.value);

  //   const nodesAndRelationships = getNodesAndRelationshipsFromResult(
  //     text.value,
  //   );
  //   return nodesAndRelationships;
  // }

  // return null;
};
