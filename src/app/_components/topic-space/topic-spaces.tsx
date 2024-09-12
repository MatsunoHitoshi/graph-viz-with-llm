"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { TabsContainer } from "../tab";
import type { TopicSpaceResponse } from "@/app/const/types";
import { TopicSpaceList } from "../list/topic-space-list";
import { GraphDataStatus } from "@prisma/client";

const EXAMPLE_TOPIC_SPACES: TopicSpaceResponse[] = [
  {
    id: "dd",
    image: null,
    name: "民藝",
    description: "民藝についての記述を集めて可視化するプロジェクトです",
    star: 8709,
    graphData: null,
    documents: [],
    tags: [
      {
        id: "sfewa",
        name: "文化",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sfewb",
        name: "工芸品",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sfewc",
        name: "美術",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sfewd",
        name: "オルタナティブ",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    graphDataStatus: GraphDataStatus.PROCESSING,
  },
  {
    id: "fefef",
    image: null,
    name: "90年代のビデオ・アート",
    description:
      "90年代のビデオアートに関する論考等を集めて分析を行っています。",
    star: 749,
    graphData: null,
    documents: [],
    tags: [
      {
        id: "sfewa",
        name: "アート",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sfewb",
        name: "メディアアート",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sfewc",
        name: "現代美術",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sfewd",
        name: "ビデオ",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sfewe",
        name: "映像",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    graphDataStatus: GraphDataStatus.PROCESSING,
  },

  {
    id: "fefefs",
    image: null,
    name: "現代詩",
    description: "",
    star: 98,
    graphData: null,
    documents: [],
    tags: [
      {
        id: "sfewa",
        name: "詩",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    graphDataStatus: GraphDataStatus.PROCESSING,
  },
];

export const TopicSpaces = () => {
  const { data: session } = useSession();
  const { data: topicSpaces } = api.topicSpaces.getListBySession.useQuery();
  if (!session) return null;
  return (
    <TabsContainer>
      <div className="grid  grid-flow-row grid-cols-2 gap-8  p-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 ">
            <div className="text-lg font-semibold">トピックスペース</div>
            <TopicSpaceList topicSpaces={EXAMPLE_TOPIC_SPACES} />
          </div>
        </div>
        <div className="flex flex-col gap-2"></div>
      </div>
    </TabsContainer>
  );
};
