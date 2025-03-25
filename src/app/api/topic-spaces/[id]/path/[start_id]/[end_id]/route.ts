import { api } from "@/trpc/server";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: { id: string; start_id: string; end_id: string } },
) => {
  try {
    const res = await api.topicSpaces.getPath({
      id: params.id,
      startId: params.start_id,
      endId: params.end_id,
    });

    return NextResponse.json({
      id: res.id,
      graphData: res.graphData,
    });
  } catch (error) {
    throw error;
  }
};
