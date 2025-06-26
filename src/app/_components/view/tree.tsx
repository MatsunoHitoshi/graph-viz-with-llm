"use client";
import { api } from "@/trpc/react";
import { TabsContainer } from "../tab/tab";
import { useWindowSize } from "@/app/_hooks/use-window-size";
import type { GraphDocument } from "@/server/api/routers/kg";
import type { DocumentResponse } from "@/app/const/types";
import { useEffect, useState } from "react";
import { TopicGraphDocumentList } from "../list/topic-graph-document-list";
import { Toolbar } from "../toolbar/toolbar";
import { D3RadialTree } from "../d3/tree/radial-tree";
import Slider from "react-input-slider";

export const TreeViewer = ({
  topicSpaceId,
  nodeId,
}: {
  topicSpaceId: string;
  nodeId: string;
}) => {
  const [sourceTargetSwitch, setSourceTargetSwitch] = useState<boolean>(true);
  const { data: topicSpace } = api.topicSpaces.getByIdPublic.useQuery({
    id: topicSpaceId,
  });
  const { data: treeData, refetch } = api.treeGraph.getByNodeId.useQuery({
    topicSpaceId: topicSpaceId,
    nodeId: Number(nodeId),
    isSource: sourceTargetSwitch,
  });
  const [innerWidth, innerHeight] = useWindowSize();
  const graphAreaWidth = (2 * (innerWidth ?? 100)) / 3 - 22;
  const graphAreaHeight = (innerHeight ?? 300) - 128;
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [selectedGraphData, setSelectedGraphData] =
    useState<GraphDocument | null>(null);
  const [nodeSearchQuery, setNodeSearchQuery] = useState<string>("");
  const [treeScale, setTreeScale] = useState<number>(80);

  useEffect(() => {
    refetch;
  }, [sourceTargetSwitch]);

  useEffect(() => {
    setSelectedGraphData(
      (topicSpace?.sourceDocuments?.find((document) => {
        return document.id === selectedDocumentId;
      })?.graph?.dataJson as GraphDocument) ?? null,
    );
  }, [selectedDocumentId, topicSpace]);

  if (!topicSpace) return null;
  return (
    <TabsContainer>
      <div className="grid  h-full grid-flow-row grid-cols-3 gap-8 overflow-hidden ">
        <div className="flex flex-col gap-6 overflow-scroll p-4">
          <a href={`/topic-spaces/${topicSpaceId}/graph`} className="w-max">
            <div className="text-lg font-semibold">{topicSpace.name}</div>
          </a>

          <div className="flex flex-col gap-3">
            <div className="text-sm">{topicSpace.description}</div>

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
          <div className="flex flex-col gap-4">
            <Toolbar
              setNodeSearchQuery={setNodeSearchQuery}
              sourceTargetSwitch={sourceTargetSwitch}
              setSourceTargetSwitch={setSourceTargetSwitch}
            />
            <div className="flex flex-row items-center gap-2 px-4">
              <div className="text-sm">ツリーの広さ</div>
              <Slider
                styles={{
                  active: {
                    backgroundColor: "#fb923c",
                  },
                  track: {
                    backgroundColor: "#555",
                    height: 5,
                  },
                }}
                axis="x"
                x={treeScale}
                onChange={(d) => {
                  setTreeScale(d.x);
                }}
                xmin={10}
                xmax={500}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex w-full flex-row items-center justify-between">
              <div className="font-semibold">ドキュメント</div>
            </div>

            <TopicGraphDocumentList
              documents={topicSpace.sourceDocuments as DocumentResponse[]}
              selectedDocumentId={selectedDocumentId}
              setSelectedDocumentId={setSelectedDocumentId}
            />
          </div>
        </div>
        <div className="col-span-2 py-4">
          {topicSpace.graphData && treeData ? (
            <D3RadialTree
              width={graphAreaWidth}
              height={graphAreaHeight}
              nodeSearchQuery={nodeSearchQuery}
              data={treeData}
              selectedGraphData={selectedGraphData}
              treeScale={treeScale}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center p-4">
              <div>グラフがありません</div>
              <div>{topicSpace.graphDataStatus}</div>
            </div>
          )}
        </div>
      </div>
    </TabsContainer>
  );
};
