import { api } from "@/trpc/server";
import { NextResponse } from "next/server";

export const GET = async (
  _request: Request,
  { params }: { params: { id: string } },
) => {
  try {
    const res = await api.topicSpaces.getByIdPublic({
      id: params.id,
      filterOption: { type: "tag", value: "main", cutOff: "2" },
    });
    return NextResponse.json({
      id: res.id,
      graphData: res.graphData,
    });
  } catch (error) {
    throw error;
  }
};
