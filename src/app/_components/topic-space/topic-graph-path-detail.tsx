"use client";
import { api } from "@/trpc/react";
import { TabsContainer } from "../tab/tab";
import { D3ForceGraph } from "../d3/force/graph";
import { useWindowSize } from "@/app/_hooks/use-window-size";
import type { GraphDocument } from "@/server/api/routers/kg";
import type { DocumentResponse } from "@/app/const/types";
import { useEffect, useState } from "react";
import { DocumentAttachModal } from "./document-attach-modal";
import { TopicGraphDocumentList } from "../list/topic-graph-document-list";
import { Toolbar } from "../toolbar/toolbar";
import { RelationPathSearch } from "../toolbar/relation-path-search";

export const TopicGraphPathDetail = ({
  id,
  startId,
  endId,
}: {
  id: string;
  startId: string;
  endId: string;
}) => {
  const { data: topicSpace, refetch } = api.topicSpaces.getPath.useQuery({
    id: id,
    startId: startId,
    endId: endId,
  });
  const [innerWidth, innerHeight] = useWindowSize();
  const graphAreaWidth = (2 * (innerWidth ?? 100)) / 3 - 36;
  const graphAreaHeight = (innerHeight ?? 300) - 160;
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [selectedGraphData, setSelectedGraphData] =
    useState<GraphDocument | null>(null);
  const [documentAttachModalOpen, setDocumentAttachModalOpen] =
    useState<boolean>(false);
  const [isLinkFiltered, setIsLinkFiltered] = useState<boolean>(false);
  const [nodeSearchQuery, setNodeSearchQuery] = useState<string>("");
  const [pathData, setPathData] = useState<GraphDocument>();

  useEffect(() => {
    setSelectedGraphData(
      (topicSpace?.sourceDocuments.find((document) => {
        return document.id === selectedDocumentId;
      })?.graph?.dataJson as GraphDocument) ?? null,
    );
  }, [selectedDocumentId, topicSpace]);

  if (!topicSpace) return null;
  console.log("graphData: ", selectedGraphData);

  return (
    <TabsContainer>
      <div className="grid h-full grid-flow-row grid-cols-3 gap-8">
        <div className="flex flex-col gap-6 overflow-scroll p-4">
          <a href={`/topic-spaces/${id}/graph`} className="w-max">
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
          <Toolbar
            isLinkFiltered={isLinkFiltered}
            setIsLinkFiltered={setIsLinkFiltered}
            setNodeSearchQuery={setNodeSearchQuery}
          />
          <RelationPathSearch
            defaultStartNodeId={Number(startId)}
            defaultEndNodeId={Number(endId)}
            graphData={topicSpace.graphData as GraphDocument}
            setPathData={setPathData}
            pathData={pathData}
          />

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
          {topicSpace.graphData ? (
            <D3ForceGraph
              width={graphAreaWidth}
              height={graphAreaHeight}
              graphDocument={topicSpace.graphData as GraphDocument}
              selectedGraphData={selectedGraphData}
              selectedPathData={pathData}
              isLinkFiltered={isLinkFiltered}
              nodeSearchQuery={nodeSearchQuery}
              topicSpaceId={id}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center p-4">
              <div>まだグラフが作成されていません</div>
              <div>{topicSpace.graphDataStatus}</div>
            </div>
          )}
        </div>
      </div>
      <DocumentAttachModal
        isOpen={documentAttachModalOpen}
        setIsOpen={setDocumentAttachModalOpen}
        topicSpaceId={id}
        refetch={refetch}
      />
    </TabsContainer>
  );
};
