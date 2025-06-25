import type { GraphDocument } from "@/server/api/routers/kg";
import type {
  NodeType,
  RelationshipType,
} from "./get-nodes-and-relationships-from-result";

// const generateSystemMessageForNodes = () => {
//   return `
// Your task is to identify if there are duplicated nodes and if so merge them into one node. Only merge the nodes that refer to the same entity.
// You will be given different datasets of nodes and some of these nodes may be duplicated or refer to the same entity.
// The datasets contains nodes in the form [ENTITY_ID, TYPE, PROPERTIES]. When you have completed your task please give me the
// resulting nodes in the same format. Only return the nodes and relationships no other text. If there is no duplicated nodes return the original nodes.
//   `;
// };

const deleteDuplicatedRelationships = (relationships: RelationshipType[]) => {
  const filteredRelationships = relationships.filter((relationship, index) => {
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
  const mergedRelationships = filteredRelationships.map(
    (relationship, index) => ({
      ...relationship,
      id: index,
    }),
  );
  return mergedRelationships;
};

const deleteDuplicatedNodes = (nodes: NodeType[]) => {
  const filteredNodes = nodes.filter((node, index) => {
    return (
      index ===
      nodes.findIndex((n) => n.name === node.name && n.label === node.label)
    );
  });
  return filteredNodes;
};

export const mergerNodes = (graph: GraphDocument, mergeNodes: NodeType[]) => {
  const margeTargetNode = mergeNodes[0];
  const margeSourceNodes = mergeNodes.slice(1);

  if (!margeTargetNode) {
    throw new Error("Target node is not found");
  }

  const newRelationships = graph.relationships
    .map((sRelationship) => {
      if (
        margeSourceNodes.some((mNode) => mNode.id === sRelationship.targetId) &&
        margeSourceNodes.some((mNode) => mNode.id === sRelationship.sourceId)
      ) {
        return undefined;
      } else if (
        margeSourceNodes.some((mNode) => mNode.id === sRelationship.targetId)
      ) {
        return {
          ...sRelationship,
          targetId: margeTargetNode.id,
          targetName: margeTargetNode.name,
        };
      } else if (
        margeSourceNodes.some((mNode) => mNode.id === sRelationship.sourceId)
      ) {
        return {
          ...sRelationship,
          sourceId: margeTargetNode.id,
          sourceName: margeTargetNode.name,
        };
      } else {
        return sRelationship;
      }
    })
    .filter((r) => !!r);

  const newNodes = graph.nodes.filter((node) => {
    return !margeSourceNodes.some(
      (mNode) =>
        mNode.id === node.id &&
        mNode.label === node.label &&
        mNode.name === node.name,
    );
  });

  const disambiguatedGraph = dataDisambiguation({
    nodes: newNodes,
    relationships: newRelationships,
  });

  return disambiguatedGraph;
};

const mergerGraphsWithDuplicatedNodeName = (p: {
  sourceGraph: GraphDocument;
  targetGraph: GraphDocument;
  labelCheck: boolean;
}) => {
  const { sourceGraph, targetGraph, labelCheck } = p;
  const duplicatedSourceNodes = sourceGraph.nodes.filter((sourceNode) => {
    return targetGraph.nodes.some((targetNode) => {
      return (
        targetNode.name === sourceNode.name &&
        (labelCheck ? targetNode.label === sourceNode.label : true)
      );
    });
  });
  const additionalNodes = sourceGraph.nodes.filter((sourceNode) => {
    return !targetGraph.nodes.some((targetNode) => {
      return (
        targetNode.name === sourceNode.name &&
        (labelCheck ? targetNode.label === sourceNode.label : true)
      );
    });
  });

  const newNodes = targetGraph.nodes;
  const newRelationships = targetGraph.relationships;
  const nodeIdRecords: { prevId: number; newId: number }[] = [];

  duplicatedSourceNodes.map((dNode) => {
    const prevId = dNode.id;
    const newId = newNodes.find((nn) => {
      return (
        nn.name === dNode.name && (labelCheck ? nn.label === dNode.label : true)
      );
    })?.id;
    nodeIdRecords.push({ prevId: prevId, newId: newId ?? 0 });
  });
  additionalNodes.map((additionalNode) => {
    const prevId = additionalNode.id;
    const newId =
      newNodes.reduce((max, current) => Math.max(max, current.id), 0) + 1;
    nodeIdRecords.push({ prevId: prevId, newId: newId });
    newNodes.push({ ...additionalNode, id: newId });
  });
  sourceGraph.relationships.map((sRelationship) => {
    const newId =
      newRelationships.reduce((max, current) => Math.max(max, current.id), 0) +
      1;
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
  const mergedRelationships = deleteDuplicatedRelationships(relationships);
  const mergedNodes = deleteDuplicatedNodes(nodes);
  return { nodes: mergedNodes, relationships: mergedRelationships };
};

export const dataDisambiguation = (graphDocument: GraphDocument) => {
  const disambiguatedGraph = simpleMerge(graphDocument);
  return disambiguatedGraph;
};

export const attachGraphProperties = (
  newGraph: GraphDocument,
  prevGraph: GraphDocument,
) => {
  const newNodesWithProperties = newGraph.nodes.map((nn) => {
    const matchedPrevNode = prevGraph.nodes.find((pn) => {
      return pn.name === nn.name;
    });
    if (!!matchedPrevNode && !!matchedPrevNode.properties) {
      return { ...nn, properties: matchedPrevNode.properties };
    } else {
      return nn;
    }
  });
  const newRelationshipsWithProperties = newGraph.relationships.map((nr) => {
    const matchedPrevRelationship = prevGraph.relationships.find((pr) => {
      return pr.type === nr.type;
    });
    if (!!matchedPrevRelationship && !!matchedPrevRelationship.properties) {
      return { ...nr, properties: matchedPrevRelationship.properties };
    } else {
      return nr;
    }
  });

  return {
    nodes: newNodesWithProperties,
    relationships: newRelationshipsWithProperties,
  };
};

export const fuseGraphs = async (p: {
  sourceGraph: GraphDocument;
  targetGraph: GraphDocument;
  labelCheck: boolean;
}) => {
  const graph = mergerGraphsWithDuplicatedNodeName(p);
  const disambiguatedGraph = dataDisambiguation(graph);
  return disambiguatedGraph;
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
