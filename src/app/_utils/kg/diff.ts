import { GraphChangeType } from "@prisma/client";
import type {
  NodeType,
  RelationshipType,
} from "./get-nodes-and-relationships-from-result";

export const diffNodes = (
  originalNodes: NodeType[],
  updatedNodes: NodeType[],
) => {
  const diffNodes = originalNodes
    .map((node) => {
      const sameIdNode = updatedNodes.find(
        (updatedNode) => updatedNode.id === node.id,
      );
      const isUpdated =
        sameIdNode?.name !== node.name ||
        sameIdNode?.label !== node.label ||
        JSON.stringify(sameIdNode?.properties) !==
          JSON.stringify(node.properties);
      if (sameIdNode && isUpdated) {
        return {
          type: GraphChangeType.UPDATE,
          original: node,
          updated: sameIdNode,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const addedNodes = updatedNodes
    .map((node) => {
      if (!originalNodes.some((originalNode) => originalNode.id === node.id)) {
        return {
          type: GraphChangeType.ADD,
          updated: node,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const removedNodes = originalNodes
    .map((node) => {
      if (!updatedNodes.some((updatedNode) => updatedNode.id === node.id)) {
        return {
          type: GraphChangeType.REMOVE,
          original: node,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return [...diffNodes, ...addedNodes, ...removedNodes];
};

export const diffRelationships = (
  originalRelationships: RelationshipType[],
  updatedRelationships: RelationshipType[],
) => {
  const diffRelationships = originalRelationships
    .map((relationship) => {
      const sameIdRelationship = updatedRelationships.find(
        (updatedRelationship) => updatedRelationship.id === relationship.id,
      );
      const isUpdated =
        sameIdRelationship?.sourceId !== relationship.sourceId ||
        sameIdRelationship?.targetId !== relationship.targetId ||
        sameIdRelationship?.type !== relationship.type ||
        JSON.stringify(sameIdRelationship?.properties) !==
          JSON.stringify(relationship.properties);

      if (sameIdRelationship && isUpdated) {
        return {
          type: GraphChangeType.UPDATE,
          original: relationship,
          updated: sameIdRelationship,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const addedRelationships = updatedRelationships
    .map((relationship) => {
      if (
        !originalRelationships.some(
          (originalRelationship) => originalRelationship.id === relationship.id,
        )
      ) {
        return {
          type: GraphChangeType.ADD,
          updated: relationship,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const removedRelationships = originalRelationships
    .map((relationship) => {
      if (
        !updatedRelationships.some(
          (updatedRelationship) => updatedRelationship.id === relationship.id,
        )
      ) {
        return {
          type: GraphChangeType.REMOVE,
          original: relationship,
        };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return [...diffRelationships, ...addedRelationships, ...removedRelationships];
};
