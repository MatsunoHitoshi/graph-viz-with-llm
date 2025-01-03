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
import { useEffect, useMemo, useState } from "react";
import { GraphInfoPanel } from "./graph-info-panel";
import { D3ZoomProvider } from "../zoom";

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

export const D3ForceGraph = ({
  height,
  width,
  graphDocument,
  selectedGraphData,
  isLinkFiltered = false,
  nodeSearchQuery,
  topicSpaceId,
}: {
  height: number;
  width: number;
  graphDocument: GraphDocument;
  selectedGraphData?: GraphDocument | null;
  isLinkFiltered?: boolean;
  nodeSearchQuery?: string;
  topicSpaceId?: string;
}) => {
  const { nodes, relationships } = graphDocument;
  const initLinks = relationships as CustomLinkType[];
  const initNodes = isLinkFiltered ? linkFilter(nodes, initLinks) : nodes;

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
          .distance(35)
          .strength(0.1),
      )
      .force("center", forceCenter(centerX, centerY))
      .force("charge", forceManyBody())
      .force("x", forceX())
      .force("y", forceY())
      .force("collision", forceCollide(1));

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
          const nodeVisible = !(
            nodes.length > 1000 && (neighborLinkCount ?? 0) <= visibleByScaling
          );

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
  ]);

  return (
    <div className="flex flex-col">
      <div className={`h-[${String(height)}px] w-[${String(width)}px]`}>
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

              const sourceNode = getNodeById(modSource.id, graphNodes);
              const targetNode = getNodeById(modTarget.id, graphNodes);

              if (
                ((sourceNode?.visible ?? false) ||
                  (targetNode?.visible ?? false)) &&
                modSource.x !== undefined &&
                modTarget.x !== undefined &&
                modSource.y !== undefined &&
                modTarget.y !== undefined
              ) {
                const gradientTo: number | undefined = !sourceNode?.visible
                  ? sourceNode?.id
                  : !targetNode?.visible
                    ? targetNode?.id
                    : undefined;

                // const gradientFrom: number | undefined =
                //   gradientTo === sourceNode?.id
                //     ? targetNode?.id
                //     : sourceNode?.id;

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
                      stroke={isFocused ? "#ef7234" : "white"}
                      // stroke={
                      //   isFocused
                      //     ? "#ef7234"
                      //     : !!gradientTo
                      //       ? `url(#gradient-${graphLink.id})`
                      //       : "white"
                      // }
                      strokeWidth={isFocused ? 3 : 2}
                      strokeOpacity={isFocused ? 1 : !!gradientTo ? 0.04 : 0.4}
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
                        x2={gradientFrom === modTarget.id ? "100%" : "0%"}
                        y2={gradientFrom === modTarget.id ? "100%" : "0%"}
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

              if ((graphNode.visible ?? false) || queryFiltered || isFocused) {
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
                      r={1.6 * ((graphNode.neighborLinkCount ?? 0) * 0.1 + 2.4)}
                      fill={
                        isFocused
                          ? "#ef7234"
                          : graphUnselected
                            ? "#324557"
                            : "whitesmoke"
                      }
                      cx={graphNode.x}
                      cy={graphNode.y}
                      stroke="#eae80c"
                      strokeWidth={queryFiltered ? 2.5 : 0}
                    />
                    {currentScale > 0.7 && (
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
