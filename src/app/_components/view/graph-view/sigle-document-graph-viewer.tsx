"use client";
import { useRef, useState } from "react";
import type { GraphDocument } from "@/server/api/routers/kg";
import {
  CustomLinkType,
  CustomNodeType,
  D3ForceGraph,
} from "@/app/_components/d3/force/graph";
import { Toolbar } from "@/app/_components/toolbar/toolbar";
import { api } from "@/trpc/react";
import { Link2Icon } from "@/app/_components/icons";
import { UrlCopy } from "@/app/_components/url-copy/url-copy";
import { useWindowSize } from "@/app/_hooks/use-window-size";
import { exportTxt } from "@/app/_utils/sys/svg";

export const SingleDocumentGraphViewer = ({ graphId }: { graphId: string }) => {
  const { data: graphDocument } = api.documentGraph.getById.useQuery({
    id: graphId,
  });
  const [isLinkFiltered, setIsLinkFiltered] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nodeSearchQuery, setNodeSearchQuery] = useState<string>("");
  const [innerWidth, innerHeight] = useWindowSize();
  const graphAreaWidth = (innerWidth ?? 100) - 18;
  const graphAreaHeight = (innerHeight ?? 300) - 130;
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentScale, setCurrentScale] = useState<number>(1);
  const [focusedNode, setFocusedNode] = useState<CustomNodeType | undefined>(
    undefined,
  );
  const [focusedLink, setFocusedLink] = useState<CustomLinkType | undefined>(
    undefined,
  );
  if (!graphDocument) return null;
  return (
    <div>
      <div className="h-full w-full p-2">
        <div className="flex h-full w-full flex-col divide-y divide-slate-400 overflow-hidden rounded-md border border-slate-400  text-slate-50">
          <div className="px-4">
            <Toolbar
              isLinkFiltered={isLinkFiltered}
              setIsLinkFiltered={setIsLinkFiltered}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              setNodeSearchQuery={setNodeSearchQuery}
              rightArea={
                <div className="flex w-full max-w-[300px] flex-row items-center gap-4">
                  <UrlCopy
                    messagePosition="inButton"
                    className="flex !h-8 !w-8 flex-row items-center justify-center px-0 py-0"
                  >
                    <div className="h-4 w-4">
                      <Link2Icon height={16} width={16} color="white" />
                    </div>
                  </UrlCopy>
                  <div className="w-full truncate">
                    参照：
                    {graphDocument.sourceDocument.url.includes(
                      "/input-txt/",
                    ) ? (
                      <button
                        onClick={() => {
                          exportTxt(
                            graphDocument.sourceDocument.url,
                            graphDocument.sourceDocument.name,
                          );
                        }}
                        className="underline hover:no-underline"
                      >
                        {graphDocument.sourceDocument.name}
                      </button>
                    ) : (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full underline hover:no-underline"
                        href={graphDocument.sourceDocument.url}
                      >
                        {graphDocument.sourceDocument.name}
                      </a>
                    )}
                  </div>
                </div>
              }
            />
          </div>

          {isEditing ? (
            <D3ForceGraph
              svgRef={svgRef}
              width={graphAreaWidth}
              height={graphAreaHeight}
              graphDocument={graphDocument.dataJson as GraphDocument}
              isLinkFiltered={isLinkFiltered}
              nodeSearchQuery={nodeSearchQuery}
              currentScale={currentScale}
              setCurrentScale={setCurrentScale}
              setFocusedNode={setFocusedNode}
              focusedNode={focusedNode}
              setFocusedLink={setFocusedLink}
              focusedLink={focusedLink}
              isLargeGraph={false}
            />
          ) : (
            <D3ForceGraph
              svgRef={svgRef}
              width={graphAreaWidth}
              height={graphAreaHeight}
              graphDocument={graphDocument.dataJson as GraphDocument}
              isLinkFiltered={isLinkFiltered}
              nodeSearchQuery={nodeSearchQuery}
              currentScale={currentScale}
              setCurrentScale={setCurrentScale}
              setFocusedNode={setFocusedNode}
              focusedNode={focusedNode}
              setFocusedLink={setFocusedLink}
              focusedLink={focusedLink}
              isLargeGraph={false}
              isEditor={true}
              onGraphUpdate={(updatedGraph) => {
                console.log("updatedGraph: ", updatedGraph);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
