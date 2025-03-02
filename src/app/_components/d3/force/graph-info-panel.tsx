import React, { useState } from "react";
import { Button } from "../../button/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TriangleRightIcon,
} from "../../icons";
import type { CustomLinkType, CustomNodeType } from "./graph";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { NodePropertiesForm } from "../../form/node-properties-form";

type GraphInfoPanelProps = {
  focusedNode: CustomNodeType | undefined;
  focusedLink: CustomLinkType | undefined;
  setFocusNode: React.Dispatch<
    React.SetStateAction<CustomNodeType | undefined>
  >;
  graphNodes: CustomNodeType[];
  graphLinks: CustomLinkType[];
  topicSpaceId?: string;
  isEditor?: boolean;
  refetch?: () => void;
  // maxHeight: number;
};

export const GraphInfoPanel = ({
  focusedNode,
  focusedLink,
  setFocusNode,
  graphNodes,
  graphLinks,
  topicSpaceId,
  isEditor = false,
  refetch,
  // maxHeight,
}: GraphInfoPanelProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const neighborLinks = graphLinks.filter((link) => {
    return (
      link.sourceId === focusedNode?.id || link.targetId === focusedNode?.id
    );
  });
  const getNodeById = (id: number) => {
    return graphNodes.find((node) => {
      return node.id === id;
    });
  };
  const neighborNodes = neighborLinks.map((link) => {
    const neighborId =
      link.targetId === focusedNode?.id ? link.sourceId : link.targetId;
    return getNodeById(neighborId);
  });

  return (
    <div
      className={`absolute flex max-h-[500px] flex-row items-start gap-2 overflow-y-scroll rounded-[10px] bg-black/20 p-4 backdrop-blur-sm ${isPanelOpen ? "right-3 w-[400px] pr-14" : "right-6 w-0 pr-12"}`}
    >
      <Button
        onClick={() => {
          setIsPanelOpen(!isPanelOpen);
        }}
        className="sticky top-0 !h-8 !w-8 !p-2"
      >
        {isPanelOpen ? (
          <ChevronRightIcon width={16} height={16} color="white" />
        ) : (
          <ChevronLeftIcon width={16} height={16} color="white" />
        )}
      </Button>

      {isPanelOpen && (
        <div className="flex w-full flex-col gap-6 overflow-x-hidden">
          <div className="flex h-full w-full flex-col gap-2 rounded-md border border-slate-400 p-2">
            <div className="w-full font-semibold text-slate-50">
              選択中のノード
            </div>

            <Disclosure>
              <DisclosureButton className="group w-full">
                <>
                  {focusedNode && (
                    <div className="flex w-full flex-col text-orange-500">
                      <div className="flex w-full flex-row items-center gap-2">
                        <div className="flex flex-row items-center">
                          <div className="group-data-[open]:rotate-90">
                            <TriangleRightIcon
                              height={20}
                              width={20}
                              color="white"
                            />
                          </div>
                          <div className="flex w-max flex-col items-center justify-center truncate rounded-full bg-white px-2 py-1 text-sm font-semibold text-orange-500">
                            {focusedNode.name}
                          </div>
                        </div>

                        <div className="flex w-max flex-row items-center justify-center rounded-md bg-white px-2 text-sm text-slate-900">
                          {focusedNode.label}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              </DisclosureButton>

              {isEditor && focusedNode && (
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex flex-row items-center gap-1">
                    <div className="font-semibold">プロパティ</div>

                    <Button
                      className="!p-1 !text-sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      {isEditing ? "キャンセル" : "編集"}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1">
                    {isEditing && topicSpaceId && refetch ? (
                      <NodePropertiesForm
                        focusedNode={focusedNode}
                        topicSpaceId={topicSpaceId}
                        refetch={refetch}
                        setIsEditing={setIsEditing}
                      />
                    ) : (
                      <>
                        {Object.entries(focusedNode.properties ?? {}).map(
                          ([key, value], index) => (
                            <div key={index}>
                              {key}: {value}
                            </div>
                          ),
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <DisclosurePanel className="flex w-full flex-col gap-2 pl-5">
                {!!topicSpaceId && (
                  <a
                    className="w-max cursor-pointer rounded-md bg-slate-500 p-2 text-sm text-white"
                    href={`/topic-spaces/${topicSpaceId}/tree/${focusedNode?.id}`}
                  >
                    ツリー表示
                  </a>
                )}

                <div className="text-sm">隣接しているノード</div>
                <div className="flex w-full flex-col divide-y divide-slate-400">
                  {neighborNodes.map((node, index) => {
                    return (
                      <button
                        key={index}
                        className="flex w-full cursor-pointer flex-col gap-1 p-1 hover:bg-slate-50/10"
                        onClick={() => {
                          if (!!node) setFocusNode(node);
                        }}
                      >
                        <div className="flex w-max flex-col items-center justify-center truncate rounded-full bg-white px-2 py-1 text-sm font-semibold text-orange-500">
                          {node?.name}
                        </div>
                        <div className="truncate text-xs">
                          {neighborLinks[index]?.type}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </DisclosurePanel>
            </Disclosure>
          </div>

          <div className="flex w-full flex-col gap-2 rounded-md border border-slate-400 p-2">
            <div className="font-semibold text-slate-50">選択中のリンク</div>
            {focusedLink && (
              <div className="flex max-w-[300px] flex-col text-orange-500">
                <div className="font-semibold">
                  <div className="flex w-max flex-col items-center">
                    <div className="flex w-max flex-col items-center justify-center truncate rounded-md bg-white p-1 text-sm">
                      {focusedLink.sourceName}
                    </div>
                    <div>|</div>
                    <div className="truncate text-sm">{focusedLink.type}</div>
                    <div>↓</div>
                    <div className="flex w-max flex-col items-center justify-center truncate rounded-md bg-white p-1 text-sm">
                      {focusedLink.targetName}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
