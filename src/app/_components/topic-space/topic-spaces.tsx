"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { TabsContainer } from "../tab/tab";
import type { TopicSpaceResponse } from "@/app/const/types";
import { TopicSpaceList } from "../list/topic-space-list";
import { useState } from "react";
import { TopicSpaceCreateModal } from "./topic-space-create-modal";

export const TopicSpaces = () => {
  const { data: session } = useSession();
  const { data: topicSpaces } = api.topicSpaces.getListBySession.useQuery();
  const [topicSpaceCreateModalOpen, setTopicSpaceCreateModalOpen] =
    useState<boolean>(false);
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
    </TabsContainer>
  );
};
