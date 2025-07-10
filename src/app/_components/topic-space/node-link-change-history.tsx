import { ChangeTypeMap, EntityTypeMap } from "@/app/const/types";
import { api } from "@/trpc/react";
import React from "react";

export const NodeLinkChangeHistory = ({
  graphChangeHistoryId,
}: {
  graphChangeHistoryId: string;
}) => {
  const { data: graphChangeHistory } =
    api.topicSpaceChangeHistory.getById.useQuery({
      id: graphChangeHistoryId,
    });

  if (!graphChangeHistory) return null;

  return (
    <div className="mt-2 flex flex-col gap-2">
      {graphChangeHistory.nodeLinkChangeHistories.map((history) => {
        const previousState = JSON.stringify(history.previousState, null, 2);
        const nextState = JSON.stringify(history.nextState, null, 2);

        return (
          <div key={history.id} className="rounded-lg bg-slate-700 p-2">
            <p className="text-sm font-semibold">
              {EntityTypeMap[history.changeEntityType]}の
              {ChangeTypeMap[history.changeType]}
            </p>
            <p className="text-xs">ID: {history.changeEntityId}</p>

            {previousState !== "{}" && (
              <div className="mt-2">
                <p className="text-sm font-semibold">変更前</p>
                <pre className="rounded-lg bg-pink-950/40 p-2 text-xs">
                  <code style={{ whiteSpace: "pre-wrap" }}>
                    {previousState}
                  </code>
                </pre>
              </div>
            )}

            <div className="mt-2">
              <p className="text-sm font-semibold">変更後</p>
              <pre className="rounded-lg bg-green-950/40 p-2 text-xs">
                <code style={{ whiteSpace: "pre-wrap" }}>{nextState}</code>
              </pre>
            </div>
          </div>
        );
      })}
    </div>
  );
};
