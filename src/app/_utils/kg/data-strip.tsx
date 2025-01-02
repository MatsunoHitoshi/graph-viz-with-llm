import type { GraphDocument } from "@/server/api/routers/kg";

export const stripGraphData = (graph: GraphDocument) => {
  const strippedGraph = {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      name: node.name,
      properties: node.properties,
    })),
    relationships: graph.relationships,
  };
  return strippedGraph;
};
