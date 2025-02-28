import type {
  SourceDocument,
  User,
  DocumentGraph,
  TopicSpace,
  Tag,
  Activity,
} from "@prisma/client";

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
};
