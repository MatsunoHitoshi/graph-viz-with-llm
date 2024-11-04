import type { NextPage } from "next";
import { TreeViewer } from "@/app/_components/view/tree";

type PageParams = { params: { id: string; node_id: string } };

const Page: NextPage<PageParams> = async ({ params }: PageParams) => {
  const { id: topicSpaceId, node_id: nodeId } = params;

  if (!topicSpaceId) return null;
  return (
    <main className="z-0 flex min-h-screen flex-col items-center justify-center bg-slate-800">
      <div className="flex h-screen w-full flex-col items-center  justify-center pt-16">
        <TreeViewer topicSpaceId={topicSpaceId} nodeId={nodeId} />
      </div>
    </main>
  );
};

export default Page;
