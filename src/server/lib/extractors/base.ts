import type {
  NodeType,
  RelationshipType,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";

export type NodesAndRelationships = {
  nodes: NodeType[];
  relationships: RelationshipType[];
};

export interface Extractor {
  extract(
    localFilePath: string,
    isPlaneTextMode: boolean,
    schema?: TransformerSchema,
  ): Promise<NodesAndRelationships | null>;
}

export type TransformerSchema = {
  allowedNodes: string[];
  allowedRelationships: string[];
};
