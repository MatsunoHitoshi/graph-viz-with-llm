import type { TreeNode } from "@/app/const/types";
import type { GraphDocument } from "@/server/api/routers/kg";
import type {
  NodeType,
  RelationshipType,
} from "./get-nodes-and-relationships-from-result";

export const getTreeLayoutData = (
  graphData: GraphDocument,
  nodeId: number,
  isSource: boolean,
) => {
  const centerNode = graphData.nodes.find((node) => node.id === nodeId);
  if (!centerNode) return null;
  let treeData: TreeNode = centerNode;

  treeData = {
    ...treeData,
    children: neighborNodes(graphData, nodeId, isSource).map((child) => {
      if (child) {
        return {
          ...child,
          children: neighborNodes(graphData, child.id, isSource).map(
            (grandchild) => {
              if (grandchild) {
                return {
                  ...grandchild,
                  // children: neighborNodes(graphData, grandchild.id),
                };
              }
            },
          ) as TreeNode[],
        };
      }
    }) as TreeNode[],
  };

  return treeData;
};

const sourceLinks = (links: RelationshipType[], nodeId: number) =>
  links.filter((link) => {
    return link.sourceId === nodeId;
  });

const targetLinks = (links: RelationshipType[], nodeId: number) =>
  links.filter((link) => {
    return link.targetId === nodeId;
  });

const getNodeById = (id: number, nodes: NodeType[]) => {
  return nodes.find((node) => {
    return node.id === id;
  });
};
const neighborNodes = (
  graphData: GraphDocument,
  nodeId: number,
  isSource: boolean,
) => {
  if (isSource) {
    return sourceLinks(graphData.relationships, nodeId).map((link) => {
      const neighborId =
        link.targetId === nodeId ? link.sourceId : link.targetId;
      return getNodeById(neighborId, graphData.nodes);
    });
  } else {
    return targetLinks(graphData.relationships, nodeId).map((link) => {
      const neighborId =
        link.targetId === nodeId ? link.sourceId : link.targetId;
      return getNodeById(neighborId, graphData.nodes);
    });
  }
};
