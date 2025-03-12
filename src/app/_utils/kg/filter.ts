import type { TopicGraphFilterOption } from "@/app/const/types";
import type { GraphDocument } from "@/server/api/routers/kg";
import type {
  NodeType,
  RelationshipType,
} from "./get-nodes-and-relationships-from-result";
import { nodePathSearch } from "./bfs";
import { env } from "@/env";

export const filterGraph = (
  filterOption: TopicGraphFilterOption,
  graphDocument: GraphDocument,
  topicSpaceId?: string,
) => {
  switch (filterOption.type) {
    case "tag":
      const tagFilteredNodes = graphDocument.nodes.filter((node) => {
        if (node.properties.tag) {
          return (
            node.properties.tag.toLowerCase() ===
            filterOption.value.toLowerCase()
          );
        } else {
          return false;
        }
      });
      let tagRelationships: RelationshipType[] = [];

      if (filterOption.withBetweenNodes) {
        let betweenNodes: NodeType[] = [];
        tagFilteredNodes.forEach((node, index) => {
          const next = tagFilteredNodes[index + 1];
          if (!!next) {
            const { relationships, nodes } = nodePathSearch(
              graphDocument,
              node.id,
              next.id,
            );
            tagRelationships = [
              ...tagRelationships,
              ...relationships.filter(
                (r) => !tagRelationships.some((tr) => tr.id === r.id),
              ),
            ];
            betweenNodes = [
              ...betweenNodes,
              ...nodes.filter(
                (r) => !betweenNodes.some((tr) => tr.id === r.id),
              ),
            ];
          }
        });
        return {
          nodes: [
            ...tagFilteredNodes,
            ...betweenNodes.filter(
              (r) => !tagFilteredNodes.some((tr) => tr.id === r.id),
            ),
          ],
          relationships: tagRelationships,
        };
      } else {
        const cutOff = Math.max(filterOption.cutOff ?? 5, 1);
        const nodeLength = tagFilteredNodes.length;
        tagFilteredNodes.forEach((sourceNode, sIndex) => {
          tagFilteredNodes.forEach((targetNode, tIndex) => {
            if (sIndex > tIndex) {
              const nodesDistance =
                nodePathSearch(
                  graphDocument,
                  sourceNode.id,
                  targetNode.id,
                  cutOff,
                ).nodes.length - 1;
              if (nodesDistance > 0 && nodesDistance <= cutOff) {
                const r = {
                  id: sIndex * nodeLength + tIndex,
                  sourceName: sourceNode.name,
                  targetName: targetNode.name,
                  sourceId: sourceNode.id,
                  targetId: targetNode.id,
                  type: String(nodesDistance),
                  properties: {
                    distance: String(nodesDistance),
                    url: topicSpaceId
                      ? `${env.NEXT_PUBLIC_BASE_URL}/topic-spaces/${topicSpaceId}/path/${sourceNode.id}/${targetNode.id}`
                      : "",
                  },
                } as RelationshipType;
                tagRelationships = [...tagRelationships, r];
              }
            }
          });
        });
      }
      return { nodes: tagFilteredNodes, relationships: tagRelationships };

    case "label":
      const labelFilteredNodes = graphDocument.nodes.filter((node) => {
        return node.label.toLowerCase() === filterOption.value.toLowerCase();
      });

      let labelRelationships: RelationshipType[] = [];
      let additionalNodes: NodeType[] = [];

      labelFilteredNodes.forEach((node, index) => {
        const next = labelFilteredNodes[index + 1];
        if (!!next) {
          const { relationships, nodes } = nodePathSearch(
            graphDocument,
            node.id,
            next.id,
          );
          labelRelationships = [
            ...labelRelationships,
            ...relationships.filter(
              (r) => !labelRelationships.some((tr) => tr.id === r.id),
            ),
          ];
          additionalNodes = [
            ...additionalNodes,
            ...nodes.filter(
              (r) => !additionalNodes.some((tr) => tr.id === r.id),
            ),
          ];
        }
      });
      return {
        nodes: [
          ...labelFilteredNodes,
          ...additionalNodes.filter(
            (r) => !labelFilteredNodes.some((tr) => tr.id === r.id),
          ),
        ],
        relationships: labelRelationships,
      };
  }
};

export const updateKgProperties = (
  update: GraphDocument,
  graphData: GraphDocument,
) => {
  const updatedNodes = graphData.nodes.map((node) => {
    if (update.nodes.map((n) => n.id).includes(node.id)) {
      return update.nodes.find((n) => n.id === node.id);
    } else {
      return node;
    }
  });
  const updatedRelationships = graphData.relationships.map((relationship) => {
    if (update.relationships.map((r) => r.id).includes(relationship.id)) {
      return update.relationships.find((r) => r.id === relationship.id);
    } else {
      return relationship;
    }
  });
  return {
    nodes: updatedNodes.filter((n) => typeof n !== undefined),
    relationships: updatedRelationships.filter((r) => typeof r !== undefined),
  } as GraphDocument;
};
