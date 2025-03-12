import type { GraphDocument } from "@/server/api/routers/kg";

export const shapeGraphData = (graph: GraphDocument) => {
  const shapedGraph = {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      name: node.name,
      properties: node.properties,
    })),
    relationships: graph.relationships,
  };
  return shapedGraph;
};
