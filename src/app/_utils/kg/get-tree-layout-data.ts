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
                  children: neighborNodes(graphData, grandchild.id, isSource),
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
export const neighborNodes = (
  graphData: GraphDocument,
  nodeId: number,
  isSource: boolean,
) => {
  if (isSource) {
    const nodes = sourceLinks(graphData.relationships, nodeId).map((link) => {
      return getNodeById(link.targetId, graphData.nodes);
    });
    const filteredNodes = nodes.filter((node, index) => {
      return (
        index ===
        nodes.findIndex((n) => {
          return node?.id === n?.id;
        })
      );
    });
    return filteredNodes;
  } else {
    const nodes = targetLinks(graphData.relationships, nodeId)
      .map((link) => {
        return getNodeById(link.sourceId, graphData.nodes);
      })
      .concat(
        sourceLinks(graphData.relationships, nodeId).map((link) => {
          return getNodeById(link.targetId, graphData.nodes);
        }),
      );
    const filteredNodes = nodes.filter((node, index) => {
      return (
        index ===
        nodes.findIndex((n) => {
          return node?.id === n?.id;
        })
      );
    });
    return filteredNodes;
  }
};
