import type { CustomNodeType } from "@/app/const/types";
import type { GraphDocument } from "@/server/api/routers/kg";

export const addStaticPropertiesForFrontend = (
  graphDocument: GraphDocument,
) => {
  const nodes = graphDocument.nodes;
  const links = graphDocument.relationships;

  const newNodes: CustomNodeType[] = nodes.map((node) => {
    const neighborLinkCount = links.filter((link) => {
      return link.sourceId === node.id || link.targetId === node.id;
    }).length;

    return {
      ...node,
      neighborLinkCount,
    };
  });

  return {
    ...graphDocument,
    nodes: newNodes,
  };
};
