"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { TabsContainer } from "../tab/tab";
import { DocumentList } from "../list/document-list";
import { DocumentDetail } from "./document-detail";
import { Button } from "../button/button";
import { PlusIcon, TrashIcon } from "../icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteRecordModal } from "../modal/delete-record-modal";
export const Documents = ({ id }: { id?: string }) => {
  const { data: session } = useSession();
  const { data: documents, refetch } =
    api.sourceDocument.getListBySession.useQuery();
  const document = documents?.find((document) => {
    return document.id === id;
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteIntentId, setDeleteIntentId] = useState<string>();
  const router = useRouter();

  if (!session) return null;
  return (
    <TabsContainer>
      <div className="grid h-full grid-flow-row grid-cols-2 gap-8">
        <div className="flex flex-col gap-8 overflow-scroll p-4">
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

            {documents && (
              <DocumentList
                documents={documents}
                id={id}
                menu={(document) => {
                  return (
                    <div className="flex min-w-[150px] flex-col">
                      <button
                        className="w-full px-2 py-1 hover:bg-slate-50/10"
                        onClick={() => {
                          setDeleteIntentId(document.id);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <div className="flex flex-row items-center gap-1">
                          <div className="h-4 w-4">
                            <TrashIcon width={16} height={16} color="#ea1c0c" />
                          </div>
                          <div className="text-error-red">削除</div>
                        </div>
                      </button>
                    </div>
                  );
                }}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {id && document ? (
            <DocumentDetail documentId={id} />
          ) : (
            <div className="rounded-md border border-slate-400 p-4">
              ドキュメントを選択してください
            </div>
          )}
        </div>
      </div>
      {deleteIntentId && (
        <DeleteRecordModal
          id={deleteIntentId}
          type="sourceDocument"
          isOpen={deleteModalOpen}
          setIsOpen={setDeleteModalOpen}
          refetch={refetch}
        />
      )}
    </TabsContainer>
  );
};
