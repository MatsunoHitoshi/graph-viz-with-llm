import Image from "next/image";
import { Button } from "../button/button";
import {
  DotHorizontalIcon,
  FileTextIcon,
  PersonIcon,
  StackIcon,
  StarIcon,
} from "../icons";
import type { TopicSpaceResponse } from "@/app/const/types";

type TopicSpaceCardProps = {
  topicSpace: TopicSpaceResponse;
};

export const TopicSpaceCard = ({ topicSpace }: TopicSpaceCardProps) => {
  return (
    <div className="flex w-full flex-col gap-4 rounded-md border border-slate-400 p-4">
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-row items-center gap-3">
          {topicSpace.image ? (
            <Image
              height={48}
              width={48}
              src={topicSpace.image}
              alt="topic"
              className="rounded-full border border-slate-400"
            />
          ) : (
            <div className="flex h-12 w-12 flex-row items-center justify-center rounded-full border border-slate-400">
              <StackIcon height={24} width={24} color="white" />
            </div>
          )}

          <div className="flex flex-col items-start gap-1">
            <div className="text-lg font-semibold">{topicSpace.name}</div>
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
          </div>
        </div>
        <Button className="!h-8 !w-8 bg-transparent !p-2 hover:bg-slate-50/10">
          <DotHorizontalIcon height={16} width={16} color="white" />
        </Button>
      </div>

      <div className="flex flex-row items-center justify-start gap-4">
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
            <div className="">{topicSpace.documents?.length ?? 0}</div>
          </div>
          <div className="text-sm">ドキュメント数</div>
        </div>
      </div>
    </div>
  );
};
