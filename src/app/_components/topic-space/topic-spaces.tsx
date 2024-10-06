"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { TabsContainer } from "../tab/tab";
import type { TopicSpaceResponse } from "@/app/const/types";
import { TopicSpaceList } from "../list/topic-space-list";
import { useState } from "react";
import { TopicSpaceCreateModal } from "./topic-space-create-modal";
import { TrashIcon } from "../icons";
import { DeleteModal } from "../modal/delete-modal";

export const TopicSpaces = () => {
  const { data: session } = useSession();
  const { data: topicSpaces, refetch } =
    api.topicSpaces.getListBySession.useQuery();
  const [topicSpaceCreateModalOpen, setTopicSpaceCreateModalOpen] =
    useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteIntentId, setDeleteIntentId] = useState<string>();

  if (!session) return null;
  return (
    <TabsContainer>
      <div className="grid  grid-flow-row grid-cols-2 gap-8  p-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 ">
            <div className="text-lg font-semibold">トピックスペース</div>
            {topicSpaces && (
              <TopicSpaceList
                topicSpaces={topicSpaces as TopicSpaceResponse[]}
                setTopicSpaceCreateModalOpen={setTopicSpaceCreateModalOpen}
                menu={(topicSpace) => {
                  return (
                    <div className="flex min-w-[150px] flex-col">
                      <button
                        className="w-full px-2 py-1 hover:bg-slate-50/10"
                        onClick={() => {
                          setDeleteIntentId(topicSpace.id);
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
        <div className="flex flex-col gap-2"></div>
      </div>
      <TopicSpaceCreateModal
        isOpen={topicSpaceCreateModalOpen}
        setIsOpen={setTopicSpaceCreateModalOpen}
      />
      {deleteIntentId && (
        <DeleteModal
          id={deleteIntentId}
          type="topicSpace"
          isOpen={deleteModalOpen}
          setIsOpen={setDeleteModalOpen}
          refetch={refetch}
        />
      )}
    </TabsContainer>
  );
};
