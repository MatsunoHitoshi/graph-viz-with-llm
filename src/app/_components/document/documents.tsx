"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { TabsContainer } from "../tab/tab";
import { DocumentList } from "../list/document-list";
import { DocumentDetail } from "./document-detail";
import { Button } from "../button/button";
import { PlusIcon } from "../icons";
import { useRouter } from "next/navigation";
export const Documents = ({ id }: { id?: string }) => {
  const { data: session } = useSession();
  const { data: documents } = api.sourceDocument.getListBySession.useQuery();
  const document = documents?.find((document) => {
    return document.id === id;
  });
  const router = useRouter();
  if (!session) return null;
  return (
    <TabsContainer>
      <div className="grid  grid-flow-row grid-cols-2 gap-8 p-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1 ">
            <div className="flex w-full flex-row items-center justify-between">
              <div className="text-lg font-semibold">ドキュメント</div>
              <Button
                onClick={() => {
                  router.push("/");
                }}
                className="!h-8 !w-8 !p-2"
              >
                <div className="h-4 w-4">
                  <PlusIcon width={16} height={16} color="white" />
                </div>
              </Button>
            </div>

            {documents && <DocumentList documents={documents} id={id} />}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {id && document ? (
            <DocumentDetail document={document} />
          ) : (
            <div className="rounded-md border border-slate-400 p-4">
              ドキュメントを選択してください
            </div>
          )}
        </div>
      </div>
    </TabsContainer>
  );
};
