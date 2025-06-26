import { NodeLinkList } from "@/app/_components/list/node-link-list";
import { useRef, useState } from "react";
import type { GraphDocument } from "@/server/api/routers/kg";
import type { CustomNodeType, CustomLinkType } from "@/app/const/types";
import { D3ForceGraph } from "@/app/_components/d3/force/graph";
import { GraphInfoPanel } from "@/app/_components/d3/force/graph-info-panel";
import { GraphTool } from "./graph-tool";
import { useWindowSize } from "@/app/_hooks/use-window-size";

// 編集は扱わない
export const MultiDocumentGraphViewer = ({
  graphDocument,
  topicSpaceId,
}: {
  graphDocument: GraphDocument;
  topicSpaceId: string;
}) => {
  const [innerWidth, innerHeight] = useWindowSize();
  const graphAreaWidth = (innerWidth ?? 100) / 2 - 24;
  const graphAreaHeight = (innerHeight ?? 300) - 128;

  const [isListOpen, setIsListOpen] = useState(false);
  const [focusedNode, setFocusedNode] = useState<CustomNodeType>();
  const [focusedLink, setFocusedLink] = useState<CustomLinkType>();
  //   const [tags, setTags] = useState<TagOption>();
  //   const nodeLabels = Array.from(
  //     new Set(graphDocument.nodes.map((n) => n.label)),
  //   );
  //   const tagOptions = nodeLabels.map((l, i) => {
  //     return { label: l, id: String(i), type: "label" };
  //   }) as TagOption[];
  //    const [tagFilter, setTagFilter] = useState<boolean>(false);
  //    const [tagFilterOption, setTagFilterOption] =
  //      useState<TopicGraphFilterOption>();

  const [currentScale, setCurrentScale] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement>(null);

  const isLargeGraph = graphDocument.nodes.length > 1300;

  return (
    <>
      {isListOpen ? (
        <NodeLinkList
          graphDocument={graphDocument}
          setIsListOpen={setIsListOpen}
          isListOpen={isListOpen}
          topicSpaceId={topicSpaceId ?? ""}
          isEditor={false}
          focusedNode={focusedNode}
        />
      ) : (
        <>
          <D3ForceGraph
            svgRef={svgRef}
            width={graphAreaWidth}
            height={graphAreaHeight}
            isLargeGraph={isLargeGraph}
            graphDocument={graphDocument}
            currentScale={currentScale}
            setCurrentScale={setCurrentScale}
            focusedNode={focusedNode}
            setFocusedNode={setFocusedNode}
            focusedLink={focusedLink}
            setFocusedLink={setFocusedLink}
            toolComponent={
              <>
                <GraphTool
                  svgRef={svgRef}
                  currentScale={currentScale}
                  setIsListOpen={setIsListOpen}
                  isListOpen={isListOpen}
                  isLargeGraph={isLargeGraph}
                />
                <GraphInfoPanel
                  focusedNode={focusedNode}
                  focusedLink={focusedLink}
                  graphDocument={graphDocument}
                  topicSpaceId={topicSpaceId}
                  // maxHeight={height}
                  setFocusNode={setFocusedNode}
                />
              </>
            }
          />
        </>
      )}
    </>
  );
};
