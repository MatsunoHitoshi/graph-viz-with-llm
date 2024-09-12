import type { SourceDocument, User, DocumentGraph, TopicSpace, Tag } from "@prisma/client";

// type TopicSpace = {
//   id: string;
//   name: string;
//   graphData: JSON | null;
//   description?: string;
//   image?: string;
//   star: number;
// };
export interface TopicSpaceResponse extends TopicSpace {
  documents: SourceDocument[] | null;
  admins?: User[];
  activities?: string[];
  tags?: Tag[];
}

export interface DocumentResponse extends SourceDocument {
  graph: DocumentGraph | null;
  topicSpaces?: TopicSpaceResponse[]
  tags?: Tag[]
}