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
  select,
  zoom,
} from "d3";
import type { ZoomBehavior } from "d3";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { Button } from "../../button/button";

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
}: {
  height: number;
  width: number;
  graphDocument: GraphDocument;
  selectedGraphData?: GraphDocument | null;
  isLinkFiltered?: boolean;
}) => {
  const { nodes, relationships } = graphDocument;
  const initLinks = relationships as CustomLinkType[];
  const initNodes = isLinkFiltered
    ? linkFilter(nodes as CustomNodeType[], initLinks)
    : (nodes as CustomNodeType[]);

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

  const [graphNodes, setGraphNodes] = useState<CustomNodeType[]>(initNodes);
  const [graphLinks, setGraphLinks] = useState<CustomLinkType[]>(newLinks);
  const [focusedNode, setFocusedNode] = useState<CustomNodeType>();
  const [focusedLink, setFocusedLink] = useState<CustomLinkType>();
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

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
          .strength(0.3),
      )
      .force("center", forceCenter(centerX, centerY))
      .force("charge", forceManyBody())
      .force("x", forceX())
      .force("y", forceY())
      .force("collision", forceCollide(0.2));

    simulation.on("tick", () => {
      setGraphNodes([
        ...initNodes.map((d) => {
          const neighborLinkCount = initLinks.filter((link) => {
            return link.sourceId === d.id || link.targetId === d.id;
          }).length;
          return {
            ...d,
            neighborLinkCount: neighborLinkCount,
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
  }, [graphNodes, newLinks, initNodes, width, height, initLinks]);

  useEffect(() => {
    const zoomScreen = select<Element, unknown>("#zoom");
    const zoomBehavior: ZoomBehavior<Element, unknown> = zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event: d3.D3ZoomEvent<Element, unknown>) => {
        zoomScreen.attr("transform", event.transform.toString());
      });

    zoomScreen.call(zoomBehavior);

    return () => {
      zoomScreen.on(".zoom", null);
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div className={`h-[${String(height)}px] w-[${String(width)}px]`}>
        <div
          className={`absolute flex flex-row items-start gap-2 rounded-[10px] p-4 backdrop-blur-sm ${isPanelOpen ? "right-5 w-[320px]" : "right-14 w-0"}`}
        >
          <Button
            onClick={() => {
              setIsPanelOpen(!isPanelOpen);
            }}
            className="!h-8 !w-8 !p-2"
          >
            {isPanelOpen ? (
              <ChevronRightIcon width={16} height={16} color="white" />
            ) : (
              <ChevronLeftIcon width={16} height={16} color="white" />
            )}
          </Button>

          {isPanelOpen && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="font-semibold text-slate-50">
                  選択しているNode
                </div>
                {focusedNode && (
                  <div className=" flex  flex-col text-orange-500">
                    <div className="font-semibold">{focusedNode.name}</div>
                    <div>ラベル：{focusedNode.label}</div>
                    {/* <div>{JSON.stringify(focusedNode.properties)}</div> */}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-semibold text-slate-50">
                  選択しているLink
                </div>
                {focusedLink && (
                  <div className="flex max-w-[300px] flex-col text-orange-500">
                    <div className="font-semibold">
                      {focusedLink.sourceName}
                      {"-["}
                      {focusedLink.type}
                      {"]->"}
                      {focusedLink.targetName}
                    </div>
                    {/* <div>{JSON.stringify(focusedLink.properties)}</div> */}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <svg
          id="container"
          width={width}
          height={height}
          viewBox={`0 0 ${String(width)} ${String(height)}`}
        >
          <g id="zoom">
            <rect width={width} height={height} rx={8} fill={"#1e293b"} />
            {graphLinks.map((graphLink) => {
              const { source, target, type } = graphLink;
              const modSource = source as CustomNodeType;
              const modTarget = target as CustomNodeType;
              const isFocused = graphLink.id === focusedLink?.id;
              return (
                <line
                  key={`${modSource.id}-${type}-${modTarget.id}`}
                  stroke={isFocused ? "#ef7234" : "white"}
                  className="link cursor-pointer"
                  strokeWidth={isFocused ? 6 : 4}
                  strokeOpacity={isFocused ? 1 : 0.5}
                  x1={modSource.x}
                  y1={modSource.y}
                  x2={modTarget.x}
                  y2={modTarget.y}
                  onClick={() => {
                    if (graphLink.id === focusedLink?.id) {
                      setFocusedLink(undefined);
                    } else {
                      setFocusedLink(graphLink);
                    }
                  }}
                />
              );
            })}
            {graphNodes.map((graphNode) => {
              // if (graphNode.id === 1) {
              //   console.log(graphNode.x);
              //   console.log(graphNode.y);
              // }

              const isFocused = graphNode.id === focusedNode?.id;
              const graphUnselected = selectedGraphData
                ? !selectedGraphData.nodes.some((node) => {
                    return node.name === graphNode.name;
                  })
                : false;
              return (
                <circle
                  key={graphNode.id}
                  r={6 * ((graphNode.neighborLinkCount ?? 0) * 0.25 + 1)}
                  className="node cursor-pointer"
                  fill={
                    isFocused
                      ? "#ef7234"
                      : graphUnselected
                        ? "#324557"
                        : "white"
                  }
                  cx={graphNode.x}
                  cy={graphNode.y}
                  onClick={() => {
                    if (graphNode.id === focusedNode?.id) {
                      setFocusedNode(undefined);
                    } else {
                      setFocusedNode(graphNode);
                    }
                  }}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
