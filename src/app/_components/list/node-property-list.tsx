import { D3ForceGraph, type CustomNodeType } from "../d3/force/graph";
import { Button } from "../button/button";
import { useState } from "react";
import { NodePropertiesForm } from "../form/node-properties-form";
import { PropertyInfo } from "../d3/force/graph-info-panel";
import { api } from "@/trpc/react";
import type { GraphDocument } from "@/server/api/routers/kg";
import { Loading } from "../loading/loading";
import { CrossLargeIcon } from "../icons";
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
          console.log("res client", res);
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
          <Button onClick={() => setGraphDocument(null)}>
            <CrossLargeIcon color="white" width={16} height={16} />
          </Button>
          <div className="flex w-max flex-col gap-1 rounded-md border border-gray-300 p-2">
            {/* <div className="text-sm">グラフ</div>
          <div className="flex flex-col gap-1">
            <div className="text-sm">ノード</div>
            <div className="flex flex-col gap-1">
              {graphDocument.nodes.map((node) => (
                <div key={node.id}>{node.name}</div>
              ))}
            </div>
            <div className="text-sm">エッジ</div>
            <div className="flex flex-col gap-1">
              {graphDocument.relationships.map((relationship) => (
                <div key={relationship.id}>
                  {relationship.sourceId}
                  {relationship.targetId}
                  {relationship.type}
                </div>
              ))}
            </div>
          </div> */}

            <D3ForceGraph
              width={500}
              height={500}
              graphDocument={graphDocument}
              tool={false}
              // isLinkFiltered={isLinkFiltered}
              // nodeSearchQuery={nodeSearchQuery}
            />
          </div>
        </>
      )}
    </div>
  );
};
