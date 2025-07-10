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
      {graphChangeHistory.nodeLinkChangeHistories.map((history) => (
        <div key={history.id} className="rounded-lg bg-slate-700 p-2">
          <p className="text-sm font-semibold">
            {history.changeType} {history.changeEntityType}
          </p>
          <p className="text-xs">ID: {history.changeEntityId}</p>

          <div className="mt-2">
            <p className="text-sm font-semibold">Previous State</p>
            <pre className="rounded-lg bg-pink-950/40 p-2 text-xs">
              <code style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(history.previousState, null, 2)}
              </code>
            </pre>
          </div>

          <div className="mt-2">
            <p className="text-sm font-semibold">Next State</p>
            <pre className="rounded-lg bg-green-950/40 p-2 text-xs">
              <code style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(history.nextState, null, 2)}
              </code>
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
};
