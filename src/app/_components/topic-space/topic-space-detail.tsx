"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { TabsContainer } from "../tab/tab";
import type { GraphDocument } from "@/server/api/routers/kg";
import {
  FileTextIcon,
  GraphIcon,
  PersonIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "../icons";
import { DocumentList } from "../list/document-list";
import type { DocumentResponse } from "@/app/const/types";
import { Button } from "../button/button";
import { useState } from "react";
import { DocumentAttachModal } from "./document-attach-modal";
import { LinkButton } from "../button/link-button";
import { MultiDocumentGraphViewer } from "../view/graph-view/multi-document-graph-viewer";

export const TopicSpaceDetail = ({ id }: { id: string }) => {
  const { data: session } = useSession();
  const { data: topicSpace, refetch } = api.topicSpaces.getById.useQuery({
    id: id,
    withDocumentGraph: false,
  });
  const detachDocument = api.topicSpaces.detachDocument.useMutation();

  const [documentAttachModalOpen, setDocumentAttachModalOpen] =
    useState<boolean>(false);

  if (!session || !topicSpace) return null;
  return (
    <TabsContainer>
      <div className="grid  grid-flow-row grid-cols-2 gap-8 ">
        <div className="flex flex-col gap-8 p-4">
          <a href={`/topic-spaces/${id}`} className="w-max">
            <div className="text-lg font-semibold">{topicSpace.name}</div>
          </a>

          <div className="flex flex-col gap-3">
            <div className="text-sm">{topicSpace.description}</div>

            <div className="flex flex-row items-center gap-1">
              {topicSpace.tags?.map((tag) => {
                return (
                  <div
                    key={tag.id}
                    className="rounded-sm bg-slate-50/10 p-1 text-sm"
                  >
                    {tag.name}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center justify-start gap-4 py-2">
                <div className="flex flex-col items-center">
                  <div className="flex flex-row items-center gap-2">
                    <PersonIcon height={20} width={20} color="white" />
                    <div className="">{topicSpace.admins?.length ?? "-"}</div>
                  </div>
                  <div className="text-sm">メンバー数</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex flex-row items-center gap-2">
                    <StarIcon height={20} width={20} color="white" />
                    <div className="">{topicSpace.star}</div>
                  </div>
                  <div className="text-sm">お気に入り数</div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex flex-row items-center gap-2">
                    <FileTextIcon height={20} width={20} color="white" />
                    <div className="">
                      {topicSpace.sourceDocuments?.length ?? 0}
                    </div>
                  </div>
                  <div className="text-sm">ドキュメント数</div>
                </div>
              </div>

              <div className="flex flex-row items-center gap-1">
                <LinkButton href={`/topic-spaces/${id}/edit`} className="">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row items-center gap-2">
                      <GraphIcon height={20} width={20} color="white" />
                    </div>
                    <div className="text-sm">編集する</div>
                  </div>
                </LinkButton>

                <LinkButton href={`/topic-spaces/${id}/graph`} className="">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex flex-row items-center gap-2">
                      <GraphIcon height={20} width={20} color="white" />
                    </div>
                    <div className="text-sm">公開ページ</div>
                  </div>
                </LinkButton>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex w-full flex-row items-center justify-between">
              <div className="font-semibold">ドキュメント</div>
              <Button
                onClick={() => {
                  setDocumentAttachModalOpen(true);
                }}
                className="!h-8 !w-8 !p-2"
              >
                <div className="h-4 w-4">
                  <PlusIcon width={16} height={16} color="white" />
                </div>
              </Button>
            </div>

            <DocumentList
              documents={topicSpace.sourceDocuments as DocumentResponse[]}
              type="topic"
              menu={(document) => {
                return (
                  <div className="flex min-w-[150px] flex-col">
                    <button
                      className="w-full px-2 py-1 hover:bg-slate-50/10"
                      onClick={() =>
                        detachDocument.mutate(
                          { id: id, documentId: document.id },
                          {
                            onSuccess: (res) => {
                              console.log("res: ", res);
                              refetch().catch((error) => {
                                console.error("Refetch error: ", error);
                              });
                            },
                            onError: (e) => {
                              console.log(e);
                            },
                          },
                        )
                      }
                    >
                      <div className="flex flex-row items-center gap-1">
                        <div className="h-4 w-4">
                          <TrashIcon width={16} height={16} color="#ea1c0c" />
                        </div>
                        <div className="text-error-red">
                          ドキュメントマップから削除
                        </div>
                      </div>
                    </button>
                  </div>
                );
              }}
            />
          </div>
        </div>
        <div>
          {topicSpace.graphData ? (
            <MultiDocumentGraphViewer
              graphDocument={topicSpace.graphData as GraphDocument}
              topicSpaceId={id}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center p-4">
              <div>まだグラフが作成されていません</div>
              <div>{topicSpace.graphDataStatus}</div>
            </div>
          )}
        </div>
      </div>

      <DocumentAttachModal
        isOpen={documentAttachModalOpen}
        setIsOpen={setDocumentAttachModalOpen}
        topicSpaceId={id}
        refetch={refetch}
      />
    </TabsContainer>
  );
};
