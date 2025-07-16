import { DocumentType } from "@prisma/client";

export const getTextFromDocumentFile = async (
  url: string,
  type: DocumentType,
) => {
  if (type === DocumentType.INPUT_PDF) {
    return "";
  } else {
    return await fetch(url).then((res) => res.text());
  }
};
