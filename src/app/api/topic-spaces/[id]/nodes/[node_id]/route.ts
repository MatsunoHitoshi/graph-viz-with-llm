import { GraphDocument } from "@/server/api/routers/kg";
import { api } from "@/trpc/server";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: { node_id: string; id: string } },
) => {
  try {
    const res = await api.topicSpaces.getByIdPublic({
      id: params.id,
      filterOption: { type: "tag", value: "main", cutOff: "2" },
    });

    const graphData = res.graphData as GraphDocument;
    const neighborLinks = graphData.relationships.filter(
      (link) =>
        link.sourceId === parseInt(params.node_id) ||
        link.targetId === parseInt(params.node_id),
    );
    const neighborNodes = graphData.nodes.filter((node) =>
      neighborLinks?.some(
        (l) => l.sourceId === node.id || l.targetId === node.id,
      ),
    );
    return NextResponse.json({
      id: res.id,
      graphData: {
        nodes: neighborNodes,
        relationships: neighborLinks,
      },
    });
  } catch (error) {
    throw error;
  }
};
