import type {
  NodeType,
  RelationshipType,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";
import type { GraphDocument } from "@/server/api/routers/kg";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceX,
  forceY,
  forceCollide,
} from "d3";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { GraphInfoPanel } from "./graph-info-panel";
import { D3ZoomProvider } from "../zoom";
import {
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  ShareIcon,
} from "../../icons";
import { exportSvg } from "@/app/_utils/sys/svg";

export interface CustomNodeType extends SimulationNodeDatum, NodeType {}
export interface CustomLinkType
  extends SimulationLinkDatum<CustomNodeType>,
    RelationshipType {}

const getNodeById = (id: number, nodes: NodeType[]) => {
  return nodes.find((node) => {
    return node.id === id;
  });
};

const linkFilter = (nodes: CustomNodeType[], links: CustomLinkType[]) => {
  const filteredNodes = nodes.filter((node) => {
    return links.find((link) => {
      return link.sourceId === node.id || link.targetId === node.id;
    });
  });
  return filteredNodes;
};

// const circlePosition = (index: number, length: number, type: "sin" | "cos") => {
//   const dig = index / length;
//   const radius = 400;
//   const angle = dig * Math.PI * 2;
//   return type === "sin" ? radius * Math.sin(angle) : radius * Math.cos(angle);
// };

export const D3ForceGraph = ({
  height,
  width,
  graphDocument,
  selectedGraphData,
  selectedPathData,
  isLinkFiltered = false,
  nodeSearchQuery,
  topicSpaceId,
  isClustered = false,
  graphFullScreen = false,
  setGraphFullScreen,
}: {
  height: number;
  width: number;
  graphDocument: GraphDocument;
  selectedGraphData?: GraphDocument | null;
  selectedPathData?: GraphDocument | null;
  isLinkFiltered?: boolean;
  nodeSearchQuery?: string;
  topicSpaceId?: string;
  isClustered?: boolean;
  graphFullScreen?: boolean;
  setGraphFullScreen?: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { nodes, relationships } = graphDocument;
  const initLinks = relationships as CustomLinkType[];
  const initNodes = isLinkFiltered ? linkFilter(nodes, initLinks) : nodes;
  const svgRef = useRef<SVGSVGElement>(null);
  const isLargeGraph = nodes.length > 1300;

  const newLinks = useMemo(() => {
    return initLinks.map((d) => {
      const source = getNodeById(d.sourceId, initNodes) as CustomNodeType;
      const target = getNodeById(d.targetId, initNodes) as CustomNodeType;
      return {
        ...d,
        source: source,
        target: target,
      };
    });
  }, [initLinks, initNodes]);

  const [currentScale, setCurrentScale] = useState<number>(1);
  const [currentTransformX, setCurrentTransformX] = useState<number>(0);
  const [currentTransformY, setCurrentTransformY] = useState<number>(0);
  const [graphNodes, setGraphNodes] = useState<CustomNodeType[]>(initNodes);
  const [graphLinks, setGraphLinks] = useState<CustomLinkType[]>(newLinks);
  const [focusedNode, setFocusedNode] = useState<CustomNodeType>();
  const [focusedLink, setFocusedLink] = useState<CustomLinkType>();

  useEffect(() => {
    const centerX = (width ?? 10) / 2;
    const centerY = (height ?? 10) / 2;
    const simulation = forceSimulation<CustomNodeType, CustomLinkType>(
      initNodes,
    )
      .force(
        "link",
        forceLink<CustomNodeType, CustomLinkType>(newLinks)
          .id((d) => d.id)
          .distance(20)
          .strength(0.15),
      )
      .force("center", forceCenter(centerX, centerY))
      .force("charge", forceManyBody().strength(-40))
      .force(
        "x",
        forceX().x(function (d) {
          return (
            centerX +
            (isClustered
              ? graphNodes.find((n) => n.index === d.index)?.clustered?.x ?? 0
              : 0)
          );
        }),
      )
      .force(
        "y",
        forceY().y(function (d) {
          return (
            centerY +
            (isClustered
              ? graphNodes.find((n) => n.index === d.index)?.clustered?.y ?? 0
              : 0)
          );
        }),
      )
      .force("collision", forceCollide(1));

    simulation.alpha(0.5);
    simulation.alphaDecay(0.1);

    simulation.on("tick", () => {
      setGraphNodes([
        ...initNodes.map((d) => {
          const neighborLinkCount = initLinks.filter((link) => {
            return link.sourceId === d.id || link.targetId === d.id;
          }).length;
          const visibleByScaling =
            currentScale > 4
              ? 0
              : currentScale > 3
                ? 0
                : currentScale > 2
                  ? 4
                  : currentScale > 1
                    ? 6
                    : currentScale > 0.9
                      ? 8
                      : 10;
          const nodeVisible =
            graphFullScreen ||
            !(isLargeGraph && (neighborLinkCount ?? 0) <= visibleByScaling);

          return {
            ...d,
            neighborLinkCount: neighborLinkCount,
            visible: nodeVisible,
          };
        }),
      ]);
      setGraphLinks([...newLinks]);
    });

    // dragExtension(simulation);
    // dragExtension(simulation, setGraphNodes, graphNodes);

    return () => {
      simulation.stop();
    };
  }, [
    graphNodes,
    newLinks,
    initNodes,
    width,
    height,
    initLinks,
    currentScale,
    nodes.length,
    isClustered,
  ]);

  return (
    <div className="flex flex-col">
      <div className={`h-[${String(height)}px] w-[${String(width)}px]`}>
        <div className="absolute flex flex-row items-center gap-2">
          {!!setGraphFullScreen ? (
            <button
              onClick={() => {
                setGraphFullScreen(!graphFullScreen);
              }}
              className="rounded-lg bg-black/20 p-2 backdrop-blur-sm"
            >
              {graphFullScreen ? (
                <ExitFullScreenIcon height={16} width={16} color="white" />
              ) : (
                <EnterFullScreenIcon height={16} width={16} color="white" />
              )}
            </button>
          ) : (
            <></>
          )}
          <button
            className="rounded-lg bg-black/20 p-2 backdrop-blur-sm"
            onClick={() => {
              if (svgRef.current) {
                exportSvg(svgRef.current, 4 / currentScale);
              }
            }}
          >
            <ShareIcon height={16} width={16} color="white" />
          </button>
        </div>

        {!!isLargeGraph && !graphFullScreen && (
          <div className="absolute bottom-4 flex flex-row items-center gap-1 text-xs">
            <div className="text-orange-500">
              ノード数が多いため一部のみが表示されています
            </div>
            {!!setGraphFullScreen ? (
              <button
                onClick={() => {
                  setGraphFullScreen(true);
                }}
                className="underline hover:no-underline"
              >
                全て表示
              </button>
            ) : (
              <></>
            )}
          </div>
        )}

        <GraphInfoPanel
          focusedNode={focusedNode}
          focusedLink={focusedLink}
          graphNodes={graphNodes}
          graphLinks={graphLinks}
          topicSpaceId={topicSpaceId}
          // maxHeight={height}
          setFocusNode={setFocusedNode}
        />
        <svg
          ref={svgRef}
          id="container"
          width={width}
          height={height}
          viewBox={`0 0 ${String(width)} ${String(height)}`}
        >
          <D3ZoomProvider
            setCurrentScale={setCurrentScale}
            setCurrentTransformX={setCurrentTransformX}
            setCurrentTransformY={setCurrentTransformY}
            currentScale={currentScale}
            currentTransformX={currentTransformX}
            currentTransformY={currentTransformY}
          >
            {graphLinks.map((graphLink) => {
              const { source, target, type } = graphLink;
              const modSource = source as CustomNodeType;
              const modTarget = target as CustomNodeType;
              const isFocused = graphLink.id === focusedLink?.id;
              const isPathLink = selectedPathData?.relationships
                .map((relationship) => relationship.id)
                .includes(graphLink.id);

              const sourceNode = getNodeById(modSource.id, graphNodes);
              const targetNode = getNodeById(modTarget.id, graphNodes);
              const sourceNodeVisible = sourceNode?.visible ?? false;
              const targetNodeVisible = targetNode?.visible ?? false;

              if (
                (sourceNodeVisible || targetNodeVisible) &&
                modSource.x !== undefined &&
                modTarget.x !== undefined &&
                modSource.y !== undefined &&
                modTarget.y !== undefined
              ) {
                const isGradient = sourceNodeVisible !== targetNodeVisible;
                const gradientTo: number | undefined =
                  isGradient && targetNodeVisible
                    ? sourceNode?.id
                    : targetNode?.id;

                const gradientFrom: number | undefined =
                  gradientTo === sourceNode?.id
                    ? targetNode?.id
                    : sourceNode?.id;

                // console.log("-----");
                // console.log(
                //   "sourceNode: ",
                //   sourceNode?.id,
                //   sourceNode?.visible,
                // );
                // console.log(
                //   "targetNode: ",
                //   targetNode?.id,
                //   targetNode?.visible,
                // );
                // console.log(gradientFrom, " -> ", gradientTo);

                return (
                  <g
                    className="link cursor-pointer"
                    key={`${modSource.id}-${type}-${modTarget.id}`}
                    onClick={() => {
                      if (graphLink.id === focusedLink?.id) {
                        setFocusedLink(undefined);
                      } else {
                        setFocusedLink(graphLink);
                      }
                    }}
                  >
                    <line
                      stroke={
                        isFocused ? "#ef7234" : isPathLink ? "#eae80c" : "white"
                      }
                      // stroke={
                      //   isFocused
                      //     ? "#ef7234"
                      //     : isPathLink
                      //       ? "#eae80c"
                      //       : isGradient
                      //         ? `url(#gradient-${graphLink.id})`
                      //         : "white"
                      // }
                      strokeWidth={isFocused ? 3 : 2}
                      strokeOpacity={isFocused ? 1 : isGradient ? 0.04 : 0.4}
                      // strokeOpacity={isFocused ? 1 : isGradient ? 0.3 : 0.4}
                      x1={modSource.x}
                      y1={modSource.y}
                      x2={modTarget.x}
                      y2={modTarget.y}
                    />
                    {/* <defs>
                      <linearGradient
                        id={`gradient-${graphLink.id}`}
                        x1={gradientTo === modSource.id ? "0%" : "100%"}
                        y1={gradientTo === modSource.id ? "0%" : "100%"}
                        x2={gradientTo === modTarget.id ? "0%" : "100%"}
                        y2={gradientTo === modTarget.id ? "0%" : "100%"}
                      >
                        <stop offset="0%" stopColor="white" stopOpacity={0} />
                        <stop
                          offset="100%"
                          stopColor="white"
                          stopOpacity={0.3}
                        />
                      </linearGradient>
                    </defs> */}
                    {currentScale > 3.5 && (
                      <text
                        x={(modSource.x + modTarget.x) / 2}
                        y={(modSource.y + modTarget.y) / 2}
                        textAnchor="middle"
                        fill={"darkgray"}
                        fontSize={2.5}
                      >
                        {graphLink.type}
                      </text>
                    )}
                  </g>
                );
              }
            })}
            {graphNodes.map((graphNode) => {
              const isFocused = graphNode.id === focusedNode?.id;
              const isPathNode = selectedPathData?.nodes
                .map((node) => node.id)
                .includes(graphNode.id);
              const graphUnselected = selectedGraphData
                ? !selectedGraphData.nodes.some((node) => {
                    return node.name === graphNode.name;
                  })
                : false;
              const queryFiltered =
                !!nodeSearchQuery &&
                nodeSearchQuery !== "" &&
                graphNode.name
                  .toLowerCase()
                  .includes(nodeSearchQuery.toLowerCase());

              if (
                (graphNode.visible ?? false) ||
                queryFiltered ||
                isFocused ||
                isPathNode
              ) {
                return (
                  <g
                    key={graphNode.id}
                    className="node cursor-pointer"
                    onClick={() => {
                      if (graphNode.id === focusedNode?.id) {
                        setFocusedNode(undefined);
                      } else {
                        setFocusedNode(graphNode);
                      }
                    }}
                  >
                    <circle
                      r={1.6 * ((graphNode.neighborLinkCount ?? 0) * 0.1 + 3.6)}
                      fill={
                        isFocused
                          ? "#ef7234"
                          : isPathNode
                            ? "#eae80c"
                            : graphUnselected
                              ? "#324557"
                              : isClustered && graphNode.nodeColor
                                ? graphNode.nodeColor
                                : "whitesmoke"
                      }
                      cx={graphNode.x}
                      cy={graphNode.y}
                      stroke="#eae80c"
                      strokeWidth={queryFiltered ? 2.5 : 0}
                    />
                    {(currentScale > 0.7 || graphFullScreen) && (
                      <text
                        x={graphNode.x}
                        y={graphNode.y}
                        textAnchor="middle"
                        fill={queryFiltered ? "#eab000" : "dimgray"}
                        fontSize={
                          currentScale > 4 ? 3 : currentScale > 3 ? 4 : 6
                        }
                      >
                        {graphNode.name}
                      </text>
                    )}
                  </g>
                );
              } else {
                return;
              }
            })}
          </D3ZoomProvider>
        </svg>
      </div>
    </div>
  );
};
