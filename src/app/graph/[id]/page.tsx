import type { NextPage } from "next";
import { GraphEditor } from "@/app/_components/view/graph";

type PageParams = { params: Promise<{ id: string }> };

const Page: NextPage<PageParams> = async ({ params }: PageParams) => {
  const { id } = await params;
  if (!id) return null;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900">
      <div className="container flex flex-col items-center justify-center pt-16">
        <GraphEditor graphId={id} />
      </div>
    </main>
  );
};

export default Page;
