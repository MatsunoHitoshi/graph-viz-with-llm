import type { TreeNode } from "@/app/const/types";
import type { GraphDocument } from "@/server/api/routers/kg";
import type {
  NodeType,
  RelationshipType,
} from "./get-nodes-and-relationships-from-result";

export const getTreeLayoutData = (
  graphData: GraphDocument,
  nodeId: number,
  edgeType: EdgeType,
) => {
  const centerNode = graphData.nodes.find((node) => node.id === nodeId);
  if (!centerNode) return null;
  let treeData: TreeNode = centerNode;

  treeData = buildTreeNode(graphData, centerNode, edgeType, 2);

  return treeData;
};

export const sourceLinks = (links: RelationshipType[], nodeId: number) =>
  links.filter((link) => {
    return link.sourceId === nodeId;
  });

export const targetLinks = (links: RelationshipType[], nodeId: number) =>
  links.filter((link) => {
    return link.targetId === nodeId;
  });

const getNodeById = (id: number, nodes: NodeType[]) => {
  return nodes.find((node) => {
    return node.id === id;
  });
};

export type EdgeType = "IN" | "OUT" | "BOTH";
export const neighborNodes = (
  graphData: GraphDocument,
  nodeId: number,
  edgeType: EdgeType,
) => {
  switch (edgeType) {
    case "IN":
      const inNodes = targetLinks(graphData.relationships, nodeId).map(
        (link) => {
          return getNodeById(link.sourceId, graphData.nodes);
        },
      );
      return inNodes.filter((node, index) => {
        return (
          index ===
          inNodes.findIndex((n) => {
            return node?.id === n?.id;
          })
        );
      });
    case "OUT":
      const outNodes = sourceLinks(graphData.relationships, nodeId).map(
        (link) => {
          return getNodeById(link.targetId, graphData.nodes);
        },
      );
      const filteredOutNodes = outNodes.filter((node, index) => {
        return (
          index ===
          outNodes.findIndex((n) => {
            return node?.id === n?.id;
          })
        );
      });
      return filteredOutNodes;
    case "BOTH":
      const bothNodes = targetLinks(graphData.relationships, nodeId)
        .map((link) => {
          return getNodeById(link.sourceId, graphData.nodes);
        })
        .concat(
          sourceLinks(graphData.relationships, nodeId).map((link) => {
            return getNodeById(link.targetId, graphData.nodes);
          }),
        );
      return bothNodes.filter((node, index) => {
        return (
          index ===
          bothNodes.findIndex((n) => {
            return node?.id === n?.id;
          })
        );
      });
  }
};

export const buildTreeNode = (
  graphData: GraphDocument,
  node: NodeType,
  edgeType: EdgeType,
  depth: number,
): TreeNode => {
  if (depth === 0) return { ...node, children: [] };
  return {
    ...node,
    children: neighborNodes(graphData, node.id, edgeType)
      .filter((child): child is NodeType => Boolean(child))
      .map((child) => buildTreeNode(graphData, child, edgeType, depth - 1)),
  };
};
