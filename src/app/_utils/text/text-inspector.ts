import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "@langchain/core/documents";
import { TokenTextSplitter } from "langchain/text_splitter";

export const textInspect = async (
  localFilePath: string,
  isPlaneTextMode: boolean,
) => {
  const loader = isPlaneTextMode
    ? new TextLoader(localFilePath)
    : new PDFLoader(localFilePath);
  const rawDocs = await loader.load();

  const textSplitter = new TokenTextSplitter({
    chunkSize: 1024,
    chunkOverlap: 32,
  });

  const documents: Document[] = [];
  await Promise.all(
    rawDocs.map(async (rowDoc) => {
      const chunks = await textSplitter.splitText(rowDoc.pageContent);
      const processedDocs = chunks.map(
        (chunk, index) =>
          new Document({
            pageContent: chunk,
            metadata: {
              a: index + 1,
              ...rowDoc.metadata,
            },
          }),
      );
      documents.push(...processedDocs);
    }),
  );

  return documents;
};
