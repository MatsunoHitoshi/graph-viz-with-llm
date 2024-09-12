"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { TabsContainer } from "../tab";
import { DocumentList } from "../list/document-list";
export const Documents = () => {
  const { data: session } = useSession();
  const { data: documents } = api.sourceDocument.getListBySession.useQuery();
  if (!session) return null;
  return (
    <TabsContainer>
      <div className="grid  grid-flow-row grid-cols-2 gap-8  p-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 ">
            <div className="text-lg font-semibold">ドキュメント</div>
            {documents && <DocumentList documents={documents} />}
          </div>
        </div>
        <div className="flex flex-col gap-2"></div>
      </div>
    </TabsContainer>
  );
};
