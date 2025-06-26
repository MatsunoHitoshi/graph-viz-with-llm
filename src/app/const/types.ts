import type {
  SourceDocument,
  User,
  DocumentGraph,
  TopicSpace,
  Tag,
  Activity,
} from "@prisma/client";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";
import type {
  NodeType,
  RelationshipType,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";

export interface TopicSpaceResponse extends TopicSpace {
  sourceDocuments: DocumentResponseWithGraphData[] | null;
  admins?: User[];
  activities?: Activity[];
  tags?: Tag[];
}

export interface DocumentResponseWithGraphData extends SourceDocument {
  graph?: DocumentGraph | null;
  topicSpaces?: TopicSpaceResponse[];
  tags?: Tag[];
}
export interface DocumentResponse extends SourceDocument {
  graph?: { id: string } | null;
  topicSpaces?: TopicSpaceResponse[];
  tags?: Tag[];
}

export interface CustomNodeType extends SimulationNodeDatum, NodeType {}
export interface CustomLinkType
  extends SimulationLinkDatum<CustomNodeType>,
    RelationshipType {}

export type TreeNode = {
  id: number;
  name: string;
  children?: TreeNode[];
  label?: string;
};

export type TopicGraphFilterOption = {
  type: "label" | "tag";
  value: string;
  cutOff?: number;
  withBetweenNodes?: boolean;
};
