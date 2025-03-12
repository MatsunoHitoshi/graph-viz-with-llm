import type { GraphDocument } from "@/server/api/routers/kg";
import type { GraphChangeType } from "@prisma/client";

export type PropertyType = {
  [K in string]: string;
};

const itemSanitize = (item: string) => {
  return item.replace(/["\[\]{} ]/g, "");
};

const extractProperties = (list: string[]) => {
  const properties: PropertyType = {};
  list.map((item) => {
    const keyValue = itemSanitize(item);
    const res = keyValue.split(":");
    const key = res[0];
    const val = res[1];
    if (key) {
      properties[key] = val ?? "";
    }
  });
  return properties;
};

export type NodeType = {
  id: number;
  name: string;
  label: string;
  properties: PropertyType;
  neighborLinkCount?: number;
  visible?: boolean;
  clustered?: { x: number; y: number };
  nodeColor?: string;
};

export type RelationshipType = {
  id: number;
  sourceName: string;
  sourceId: number;
  type: string;
  targetName: string;
  targetId: number;
  properties: PropertyType;
};

export type NodeDiffType = {
  type: GraphChangeType;
  original?: NodeType;
  updated?: NodeType;
};

export type RelationshipDiffType = {
  type: GraphChangeType;
  original?: RelationshipType;
  updated?: RelationshipType;
};

export const createExtraNode = (
  targetName: string,
  nodesJson: NodeType[] | undefined,
) => {
  const newNode = {
    id: nodesJson?.length ?? 0,
    name: targetName,
    label: "ExtraNode",
    properties: {},
  };
  if (nodesJson) {
    nodesJson?.push(newNode);
    return newNode;
  } else {
    return newNode;
  }
};

export const getNodesAndRelationshipsFromResult = (result: string) => {
  const regex = /Nodes:\s+(.*?)\s?\s?Relationships:\s?\s?(.*)/;
  const internalRegex = /\[(.*?)\]/;
  const clearBreakResult = result.replace(/\n/g, "");

  const parsing = clearBreakResult.match(regex);
  if (!parsing?.[1] || !parsing?.[2]) {
    return null;
  }
  const rawNodes: string = parsing[1];
  const rawRelationships: string = parsing[2];

  const nodes = rawNodes
    .match(new RegExp(internalRegex, "g"))
    ?.map((node) => node.split(","));
  const relationships = rawRelationships
    .match(new RegExp(internalRegex, "g"))
    ?.map((relationship) => relationship.split(","));

  console.log("nodes: ", nodes);
  console.log("relationships: ", relationships);

  const nodesJson = nodes?.map((node, index) => {
    const properties = extractProperties(node.slice(2));
    return {
      id: index,
      name: itemSanitize(node[0] ?? ""),
      label: itemSanitize(node[1] ?? ""),
      properties: properties,
    };
  });

  const relationshipsJson = relationships?.map((relationship, index) => {
    const properties = extractProperties(relationship.slice(3));

    const sourceName = itemSanitize(relationship[0] ?? "");
    const source =
      nodesJson?.find((node) => {
        return node.name === sourceName;
      }) ?? createExtraNode(sourceName, nodesJson);

    const targetName = itemSanitize(relationship[2] ?? "");
    const target =
      nodesJson?.find((node) => {
        return targetName === node.name;
      }) ?? createExtraNode(targetName, nodesJson);

    return {
      id: index,
      sourceName: sourceName,
      sourceId: source.id,
      type: itemSanitize(relationship[1] ?? ""),
      targetName: targetName,
      targetId: target.id,
      properties: properties,
    };
  });

  console.log("nodesJson: ", nodesJson);
  console.log("relationshipsJson: ", relationshipsJson);

  return {
    nodes: nodesJson,
    relationships: relationshipsJson,
  } as GraphDocument;
};
