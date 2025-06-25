import { NodeLinkList } from "@/app/_components/list/node-link-list";
import { useRef, useState } from "react";
import type { GraphDocument } from "@/server/api/routers/kg";
import type {
  CustomLinkType,
  CustomNodeType,
} from "@/app/_components/d3/force/graph";
import { D3ForceGraph } from "@/app/_components/d3/force/graph";
import { GraphInfoPanel } from "../../d3/force/graph-info-panel";
import { GraphTool } from "../graph-view/graph-tool";
import { useWindowSize } from "@/app/_hooks/use-window-size";
import { TopicGraphFilterOption } from "@/app/const/types";
import { TagOption } from "../../input/tags-input";
import { useSession } from "next-auth/react";

export const MultiDocumentGraphDetailViewer = ({
  graphDocument,
  topicSpaceId,
  isGraphFullScreen,
  setIsGraphFullScreen,
  isClustered,
  selectedPathData,
  selectedGraphData,
}: {
  graphDocument: GraphDocument;
  topicSpaceId: string;
  isGraphFullScreen?: boolean;
  setIsGraphFullScreen?: React.Dispatch<React.SetStateAction<boolean>>;
  isClustered?: boolean;
  selectedPathData?: GraphDocument;
  selectedGraphData?: GraphDocument;
}) => {
  const [innerWidth, innerHeight] = useWindowSize();
  const { data: session } = useSession();
  const graphAreaWidth =
    (2 * (innerWidth ?? 100)) / (isGraphFullScreen ? 2 : 3) - 22;
  const graphAreaHeight = (innerHeight ?? 300) - (session ? 128 : 80);

  const [isListOpen, setIsListOpen] = useState(false);
  const [focusedNode, setFocusedNode] = useState<CustomNodeType>();
  const [focusedLink, setFocusedLink] = useState<CustomLinkType>();
  const [tags, setTags] = useState<TagOption>();
  const nodeLabels = Array.from(
    new Set(graphDocument.nodes.map((n) => n.label)),
  );
  const tagOptions = nodeLabels.map((l, i) => {
    return { label: l, id: String(i), type: "label" };
  }) as TagOption[];
  const [tagFilterOption, setTagFilterOption] =
    useState<TopicGraphFilterOption>();

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
          isEditor={true}
          focusedNode={focusedNode}
          isClustered={isClustered}
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
            isGraphFullScreen={isGraphFullScreen}
            isClustered={isClustered}
            isEditor={true}
            selectedPathData={selectedPathData}
            selectedGraphData={selectedGraphData}
            toolComponent={
              <>
                <GraphTool
                  svgRef={svgRef}
                  currentScale={currentScale}
                  setIsListOpen={setIsListOpen}
                  isListOpen={isListOpen}
                  isLargeGraph={isLargeGraph}
                  hasTagFilter={true}
                  tags={tags}
                  setTags={setTags}
                  tagOptions={tagOptions}
                  tagFilterOption={tagFilterOption}
                  isGraphFullScreen={isGraphFullScreen}
                  setIsGraphFullScreen={setIsGraphFullScreen}
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
