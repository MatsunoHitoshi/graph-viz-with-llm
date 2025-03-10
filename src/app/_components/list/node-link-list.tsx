import { GraphIcon } from "@/app/_components/icons";
import type { CustomNodeType } from "../d3/force/graph";
import { NodePropertiesForm } from "../form/node-properties-form";
import { useState } from "react";
import { PropertyInfo } from "../d3/force/graph-info-panel";
import { Button } from "../button/button";

export const NodeLinkList = ({
  graphNodes,
  setIsListOpen,
  focusedNode,
  isListOpen,
  topicSpaceId,
  isEditor,
  refetch,
  isClustered,
}: {
  graphNodes: CustomNodeType[];
  setIsListOpen: (isListOpen: boolean) => void;
  isListOpen: boolean;
  topicSpaceId: string | undefined;
  isEditor: boolean;
  refetch: (() => void) | undefined;
  focusedNode: CustomNodeType | undefined;
  isClustered: boolean;
}) => {
  return (
    <div className="flex h-screen flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <button
          className="rounded-lg bg-black/20 p-2 backdrop-blur-sm"
          onClick={() => {
            setIsListOpen(!isListOpen);
          }}
        >
          <GraphIcon width={16} height={16} color="white" />
        </button>
      </div>

      <div className="flex w-full flex-col divide-y divide-slate-400 overflow-scroll">
        {graphNodes.map((node) => {
          return (
            <div
              key={node.id}
              className={`flex flex-col gap-2 p-2 ${
                focusedNode?.id === node.id ? "bg-slate-400" : ""
              }`}
            >
              <div className="flex flex-row items-center gap-2">
                <div>{node.name}</div>
                <div className="flex w-max flex-row items-center justify-center rounded-md bg-white px-2 text-sm text-slate-900">
                  {node.label}
                </div>
                {isClustered ? (
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor: node.nodeColor?.replaceAll(" ", ""),
                    }}
                  ></div>
                ) : (
                  <></>
                )}
              </div>

              <PropertyController
                node={node}
                isEditor={isEditor}
                topicSpaceId={topicSpaceId}
                refetch={refetch}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PropertyController = ({
  node,
  isEditor,
  topicSpaceId,
  refetch,
}: {
  node: CustomNodeType;
  isEditor: boolean;
  topicSpaceId: string | undefined;
  refetch: (() => void) | undefined;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <div className="text-sm">プロパティ</div>
        {isEditor ? (
          <Button
            className="!p-1 !text-sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "キャンセル" : "編集"}
          </Button>
        ) : (
          <></>
        )}
      </div>
      <div>
        {isEditor && isEditing && topicSpaceId && refetch ? (
          <div className="flex flex-col gap-1">
            <NodePropertiesForm
              node={node}
              topicSpaceId={topicSpaceId}
              refetch={refetch}
              setIsEditing={setIsEditing}
            />
          </div>
        ) : (
          <PropertyInfo data={node} />
        )}
      </div>
    </div>
  );
};
