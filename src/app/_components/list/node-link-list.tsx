import { GraphIcon } from "@/app/_components/icons";
import type { CustomNodeType } from "../d3/force/graph";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../button/button";
import { CheckboxInput } from "../input/checkbox-input";
import { NodePropertyList } from "./node-property-list";
import { MergeNodesForm } from "../form/merge-nodes-form";

export const NodeLinkList = ({
  graphNodes,
  setIsListOpen,
  focusedNode,
  isListOpen,
  topicSpaceId,
  isEditor,
  refetch,
  isClustered,
  nodeSearchQuery,
}: {
  graphNodes: CustomNodeType[];
  setIsListOpen: (isListOpen: boolean) => void;
  isListOpen: boolean;
  topicSpaceId: string | undefined;
  isEditor: boolean;
  refetch: (() => void) | undefined;
  focusedNode: CustomNodeType | undefined;
  isClustered: boolean;
  nodeSearchQuery: string | undefined;
}) => {
  const [isNodeMergeMode, setIsNodeMergeMode] = useState<boolean>(false);
  const [mergeNodes, setMergeNodes] = useState<CustomNodeType[]>();
  const [isMergeNodesEditModalOpen, setIsMergeNodesEditModalOpen] =
    useState<boolean>(false);
  const [isNameSorted, setIsNameSorted] = useState<boolean>(false);
  const [isCentralitySorted, setIsCentralitySorted] = useState<boolean>(false);

  const nameSortedGraphNodes = useMemo(() => {
    if (isNameSorted) {
      return graphNodes.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      return graphNodes;
    }
  }, [graphNodes, isNameSorted]);

  const centralitySortedGraphNodes = useMemo(() => {
    if (isCentralitySorted) {
      return nameSortedGraphNodes.sort(
        (a, b) => (b.neighborLinkCount ?? 0) - (a.neighborLinkCount ?? 0),
      );
    } else {
      return nameSortedGraphNodes;
    }
  }, [nameSortedGraphNodes, isCentralitySorted]);

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

        {isEditor && (
          <>
            <Button
              className="!text-xs"
              onClick={() => setIsNodeMergeMode(!isNodeMergeMode)}
            >
              {isNodeMergeMode ? "統合をキャンセル" : "ノードの統合"}
            </Button>

            {isNodeMergeMode && mergeNodes && mergeNodes.length > 0 && (
              <Button
                className="!text-xs"
                onClick={() => setIsMergeNodesEditModalOpen(true)}
              >
                統合
              </Button>
            )}
          </>
        )}

        <Button
          className="!text-xs"
          onClick={() => setIsNameSorted(!isNameSorted)}
        >
          <div className={isNameSorted ? "text-orange-500" : ""}>
            名称ソート
          </div>
        </Button>

        <Button
          className="!text-xs"
          onClick={() => setIsCentralitySorted(!isCentralitySorted)}
        >
          <div className={isCentralitySorted ? "text-orange-500" : ""}>
            中心性ソート
          </div>
        </Button>
      </div>

      <div className="flex w-full flex-col divide-y divide-slate-400 overflow-scroll">
        {centralitySortedGraphNodes.map((node) => {
          const queryFiltered =
            !!nodeSearchQuery &&
            nodeSearchQuery !== "" &&
            node.name.toLowerCase().includes(nodeSearchQuery.toLowerCase());
          return (
            <div
              key={node.id}
              className={`flex w-full flex-row items-center p-2 ${
                focusedNode?.id === node.id
                  ? "bg-slate-400"
                  : queryFiltered
                    ? "bg-slate-700"
                    : ""
              }`}
            >
              {isNodeMergeMode && (
                <MergeCheck
                  node={node}
                  mergeNodes={mergeNodes}
                  setMergeNodes={setMergeNodes}
                />
              )}
              <div className="flex w-full flex-col gap-2">
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

                <NodePropertyList
                  node={node}
                  isEditor={isEditor}
                  topicSpaceId={topicSpaceId}
                  refetch={refetch}
                />
              </div>
            </div>
          );
        })}
      </div>
      {mergeNodes && setMergeNodes && topicSpaceId && refetch && (
        <MergeNodesForm
          isOpen={isMergeNodesEditModalOpen}
          setIsOpen={setIsMergeNodesEditModalOpen}
          mergeNodes={mergeNodes}
          setMergeNodes={setMergeNodes}
          topicSpaceId={topicSpaceId}
          refetch={refetch}
          setIsNodeMergeMode={setIsNodeMergeMode}
        />
      )}
    </div>
  );
};

const MergeCheck = ({
  node,
  mergeNodes,
  setMergeNodes,
}: {
  node: CustomNodeType;
  mergeNodes: CustomNodeType[] | undefined;
  setMergeNodes: React.Dispatch<
    React.SetStateAction<CustomNodeType[] | undefined>
  >;
}) => {
  const [isNodeMerge, setIsNodeMerge] = useState<boolean>(false);

  useEffect(() => {
    if (isNodeMerge) {
      setMergeNodes([...(mergeNodes ?? []), node]);
    } else {
      setMergeNodes(mergeNodes?.filter((n) => n.id !== node.id));
    }
  }, [isNodeMerge]);

  return (
    <div className="mr-2 h-6 w-6">
      <CheckboxInput enabled={isNodeMerge} setEnabled={setIsNodeMerge} />
    </div>
  );
};
