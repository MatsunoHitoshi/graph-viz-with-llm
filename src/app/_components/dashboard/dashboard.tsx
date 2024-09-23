"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { DocumentList } from "../list/document-list";
import { TabsContainer } from "../tab";
import { Button } from "../button/button";
import { PlusIcon } from "../icons";
import { useRouter } from "next/navigation";
import { TopicSpaceList } from "../list/topic-space-list";
import type { TopicSpaceResponse } from "@/app/const/types";
import { TopicSpaceCreateModal } from "../topic-space/topic-space-create-modal";
import { useState } from "react";

export const Dashboard = () => {
  const { data: session } = useSession();
  const { data: documents } = api.sourceDocument.getListBySession.useQuery();
  const { data: topicSpaces } = api.topicSpaces.getListBySession.useQuery();
  const [topicSpaceCreateModalOpen, setTopicSpaceCreateModalOpen] =
    useState<boolean>(false);
  const router = useRouter();
  if (!session) return null;
  return (
    <>
      <TabsContainer>
        <div className="grid  grid-flow-row grid-cols-2 gap-8  p-4">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center justify-between">
                <div className="text-lg font-semibold">最近のドキュメント</div>
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

              {documents && <DocumentList documents={documents} end={5} />}
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-8 text-lg font-semibold">
                最近のアクティビティ
              </div>
              {/* {documents && <DocumentList documents={documents} end={5} />} */}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center justify-between">
              <div className="text-lg font-semibold">トピックスペース</div>
              <Button
                onClick={() => {
                  console.log("topicSpaceCreateModalOpen -> true");
                  setTopicSpaceCreateModalOpen(true);
                }}
                className="!h-8 !w-8 !p-2"
              >
                <div className="h-4 w-4">
                  <PlusIcon width={16} height={16} color="white" />
                </div>
              </Button>
            </div>
            {topicSpaces && (
              <TopicSpaceList
                topicSpaces={topicSpaces as TopicSpaceResponse[]}
                end={5}
                setTopicSpaceCreateModalOpen={setTopicSpaceCreateModalOpen}
              />
            )}
          </div>
        </div>
      </TabsContainer>

      <TopicSpaceCreateModal
        isOpen={topicSpaceCreateModalOpen}
        setIsOpen={setTopicSpaceCreateModalOpen}
      />
    </>
  );
};
