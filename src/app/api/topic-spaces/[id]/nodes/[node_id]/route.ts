import type { GraphDocument } from "@/server/api/routers/kg";
import { api } from "@/trpc/server";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: { node_id: string; id: string } },
) => {
  try {
    const res = await api.topicSpaces.getByIdPublic({
      id: params.id,
      // filterOption: { type: "tag", value: "main", cutOff: "1" },
    });

    const graphData = res.graphData as GraphDocument;

    const tagFilteredNodes = graphData.nodes.filter((node) => {
      if (node.properties.tag) {
        return node.properties.tag.toLowerCase() === "main";
      } else {
        return false;
      }
    });

    const sourceNode = tagFilteredNodes.find(
      (node) => node.id === parseInt(params.node_id),
    ) ?? {
      id: parseInt(params.node_id),
      name: "",
      label: "",
      properties: {},
    };
    const sourceLinks = graphData.relationships.filter(
      (link) =>
        link.sourceId === parseInt(params.node_id) ||
        link.targetId === parseInt(params.node_id),
    );
    const neighborNodes = tagFilteredNodes.filter((node) =>
      sourceLinks?.some(
        (l) => l.sourceId === node.id || l.targetId === node.id,
      ),
    );
    const neighborNodesIds = neighborNodes.map((node) => node.id);
    const neighborLinks = graphData.relationships.filter(
      (l) =>
        neighborNodesIds.some((id) => l.sourceId === id) &&
        neighborNodesIds.some((id) => l.targetId === id),
    );

    return NextResponse.json({
      id: res.id,
      graphData: {
        nodes: neighborNodes.length !== 0 ? neighborNodes : [sourceNode],
        relationships: neighborLinks,
      },
    });
  } catch (error) {
    throw error;
  }
};
