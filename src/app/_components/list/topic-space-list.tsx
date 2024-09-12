import { TopicSpaceCard } from "../topic-space/topic-space-card";
import type { TopicSpaceResponse } from "@/app/const/types";

export const TopicSpaceList = ({
  topicSpaces,
  start = 0,
  end = topicSpaces.length,
}: {
  topicSpaces: TopicSpaceResponse[];
  start?: number;
  end?: number;
}) => {
  return (
    <div className="flex flex-col gap-3">
      {topicSpaces.slice(start, end).map((topicSpace) => {
        return (
          <div key={topicSpace.id}>
            <TopicSpaceCard topicSpace={topicSpace} />
          </div>
        );
      })}
    </div>
  );
};
