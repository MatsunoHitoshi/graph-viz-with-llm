import type { NextPage } from "next";
import { TopicSpaceDetail } from "@/app/_components/topic-space/topic-space-detail";

type PageParams = { params: { id: string } };

const Page: NextPage<PageParams> = async ({ params }: PageParams) => {
  const topicSpaceId = params.id;
  if (!topicSpaceId) return null;
  return (
    <main className="z-0 flex min-h-screen flex-col items-center justify-center bg-slate-900">
      <div className="flex h-screen w-full flex-col items-center  justify-center pt-16">
        <TopicSpaceDetail id={topicSpaceId} />
      </div>
    </main>
  );
};

export default Page;
