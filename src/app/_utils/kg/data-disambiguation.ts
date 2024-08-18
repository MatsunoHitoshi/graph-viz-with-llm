import type { GraphDocument } from "@/server/api/routers/kg";
import type { RelationshipType } from "./get-nodes-and-relationships-from-result";

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
