import { TopicGraphPathDetail } from "@/app/_components/topic-space/topic-graph-path-detail";
import type { NextPage } from "next";

type PageParams = { params: { id: string; start_id: string; end_id: string } };

const Page: NextPage<PageParams> = async ({ params }: PageParams) => {
  const topicSpaceId = params.id;
  const startId = params.start_id;
  const endId = params.end_id;
  if (!topicSpaceId || !startId || !endId) return null;
  return (
    <main className="z-0 flex min-h-screen flex-col items-center justify-center bg-slate-900">
      <div className="flex h-screen w-full flex-col items-center  justify-center pt-16">
        <TopicGraphPathDetail
          id={topicSpaceId}
          startId={startId}
          endId={endId}
        />
      </div>
    </main>
  );
};

export default Page;
