import { TopicGraphDetail } from "@/app/_components/topic-space/topic-graph-detail";
import type { NextPage } from "next";

type PageParams = { params: { id: string; tag_name: string } };

const Page: NextPage<PageParams> = async ({ params }: PageParams) => {
  const topicSpaceId = params.id;
  const tagName = params.tag_name;
  if (!topicSpaceId || !tagName) return null;
  return (
    <main className="z-0 flex min-h-screen flex-col items-center justify-center bg-slate-900">
      <div className="flex h-screen w-full flex-col items-center  justify-center pt-16">
        <TopicGraphDetail
          id={topicSpaceId}
          filterOption={{ type: "tag", value: tagName }}
        />
      </div>
    </main>
  );
};

export default Page;
