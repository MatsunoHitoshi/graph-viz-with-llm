import type {
  SourceDocument,
  User,
  DocumentGraph,
  TopicSpace,
  Tag,
  Activity,
} from "@prisma/client";

export interface TopicSpaceResponse extends TopicSpace {
  sourceDocuments: DocumentResponse[] | null;
  admins?: User[];
  activities?: Activity[];
  tags?: Tag[];
}

export interface DocumentResponse extends SourceDocument {
  graph: DocumentGraph | null;
  topicSpaces?: TopicSpaceResponse[];
  tags?: Tag[];
}

export type TreeNode = {
  id: number;
  name: string;
  children?: TreeNode[];
  label?: string;
};
