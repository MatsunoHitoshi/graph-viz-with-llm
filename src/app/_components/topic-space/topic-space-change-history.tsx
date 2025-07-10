"use client";

import { api } from "@/trpc/react";
import Image from "next/image";
import { NodeLinkChangeHistory } from "./node-link-change-history";
import { useState } from "react";
import { Button } from "../button/button";

export const TopicSpaceChangeHistory = ({
  topicSpaceId,
}: {
  topicSpaceId: string;
}) => {
  const { data: changeHistories } =
    api.topicSpaceChangeHistory.listByTopicSpaceId.useQuery({
      id: topicSpaceId,
    });

  const [detailHistoryId, setDetailHistoryId] = useState<string | null>(null);

  if (!changeHistories) return null;

  return (
    <div className="flex flex-col gap-2 text-sm">
      {changeHistories.map((history) => (
        <div key={history.id} className="rounded-lg bg-slate-800 p-4 text-left">
          <div className="flex items-center gap-2">
            <Image
              alt=""
              src={history.user.image ?? ""}
              height={24}
              width={24}
              className="rounded-full border border-slate-50"
            />
            <div>
              <p className="font-semibold">{history.user.name}</p>
              <p className="text-xs text-slate-400">
                {new Date(history.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div className="mt-2">{history.description}</div>
            <Button
              className="text-sm"
              onClick={() =>
                detailHistoryId === history.id
                  ? setDetailHistoryId(null)
                  : setDetailHistoryId(history.id)
              }
            >
              {detailHistoryId === history.id ? "詳細を閉じる" : "詳細"}
            </Button>
          </div>

          {detailHistoryId === history.id && (
            <NodeLinkChangeHistory graphChangeHistoryId={history.id} />
          )}
        </div>
      ))}

      {changeHistories.length === 0 && (
        <div className="rounded-md bg-slate-800 p-4 text-center text-sm text-slate-400">
          変更履歴がありません
        </div>
      )}
    </div>
  );
};
