import { D3ForceGraph } from "@/app/_components/d3/force/graph";
import { Button } from "../button/button";
import { useRef, useState } from "react";
import { NodePropertiesForm } from "../form/node-properties-form";
import { PropertyInfo } from "@/app/_components/d3/force/graph-info-panel";
import { api } from "@/trpc/react";
import type { GraphDocument } from "@/server/api/routers/kg";
import { Loading } from "../loading/loading";
import { CrossLargeIcon } from "../icons";
import { NodeLinkEditModal } from "../modal/node-link-edit-modal";
import type { CustomNodeType } from "@/app/const/types";
import type { CustomLinkType } from "@/app/const/types";
export const NodePropertyList = ({
  node,
  isEditor,
  topicSpaceId,
  refetch,
}: {
  node: CustomNodeType;
  isEditor: boolean;
  topicSpaceId?: string | undefined;
  refetch?: (() => void) | undefined;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const extractKG = api.kg.extractKG.useMutation();
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [graphDocument, setGraphDocument] = useState<GraphDocument | null>(
    null,
  );
  const integrateGraph = api.kg.integrateGraph.useMutation();
  const [isIntegrating, setIsIntegrating] = useState<boolean>(false);
  const generateGraphFromDescription = () => {
    setIsExtracting(true);
    const textContent = `${node.name}:${node.label}\n${node.properties.description}`;
    if (!textContent) return;
    const fileUrl = `data:text/plain;base64,${Buffer.from(textContent).toString("base64")}`;

    extractKG.mutate(
      {
        fileUrl: fileUrl,
        extractMode: "langChain",
        isPlaneTextMode: true,
      },
      {
        onSuccess: (res) => {
          setGraphDocument(res.data.graph);
          setIsExtracting(false);
        },
        onError: (e) => {
          console.log(e);
          setIsExtracting(false);
        },
      },
    );
  };

  const submitGraph = () => {
    setIsIntegrating(true);
    if (!topicSpaceId || !graphDocument) {
      setIsIntegrating(false);
      return;
    }
    integrateGraph.mutate(
      {
        topicSpaceId: topicSpaceId,
        graphDocument: graphDocument,
      },
      {
        onSuccess: () => {
          setIsIntegrating(false);
          setGraphDocument(null);
          refetch?.();
        },
        onError: (e) => {
          console.log(e);
          setIsIntegrating(false);
        },
      },
    );
  };

  // graph用の変数
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentScale, setCurrentScale] = useState<number>(1);
  const [focusedNode, setFocusedNode] = useState<CustomNodeType>();
  const [focusedLink, setFocusedLink] = useState<CustomLinkType>();

  // graph編集用の変数
  const [additionalGraph, setAdditionalGraph] = useState<
    GraphDocument | undefined
  >();
  const [isNodeLinkAttachModalOpen, setIsNodeLinkAttachModalOpen] =
    useState<boolean>(false);

  const onGraphUpdate = (additionalGraph: GraphDocument) => {
    console.log("onGraphUpdate", additionalGraph);
    setAdditionalGraph(additionalGraph);
    setIsNodeLinkAttachModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <div className="text-sm">プロパティ</div>
        {isEditor ? (
          <>
            <Button
              className="!p-1 !text-sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "キャンセル" : "編集"}
            </Button>
            {node.properties.description && (
              <Button
                onClick={generateGraphFromDescription}
                className="!p-1 !text-sm"
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <Loading color="white" size={12} />
                ) : (
                  <>
                    {graphDocument
                      ? "グラフの再生成"
                      : "descriptionからグラフを追加"}
                  </>
                )}
              </Button>
            )}
          </>
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
      {graphDocument && (
        <>
          <div className="flex flex-row gap-2">
            <Button onClick={() => setGraphDocument(null)}>
              <CrossLargeIcon color="white" width={16} height={16} />
            </Button>
            <Button onClick={() => submitGraph()} disabled={isIntegrating}>
              {isIntegrating ? <Loading color="white" size={12} /> : "統合"}
            </Button>
          </div>

          <div className="flex w-max flex-col gap-1 rounded-md border border-gray-300 p-2">
            <D3ForceGraph
              svgRef={svgRef}
              currentScale={currentScale}
              setCurrentScale={setCurrentScale}
              focusedNode={focusedNode}
              setFocusedNode={setFocusedNode}
              focusedLink={focusedLink}
              width={500}
              height={500}
              graphDocument={graphDocument}
              isEditor={true}
              isLargeGraph={false}
              setFocusedLink={setFocusedLink}
              toolComponent={<></>}
              onGraphUpdate={onGraphUpdate}
            />
          </div>
          <NodeLinkEditModal
            isOpen={isNodeLinkAttachModalOpen}
            setIsOpen={setIsNodeLinkAttachModalOpen}
            graphDocument={graphDocument}
            setGraphDocument={setGraphDocument}
            additionalGraph={additionalGraph}
            setAdditionalGraph={setAdditionalGraph}
          />
        </>
      )}
    </div>
  );
};
