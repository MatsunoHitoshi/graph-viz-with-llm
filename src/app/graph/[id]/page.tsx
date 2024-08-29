import type { NextPage } from "next";
import { GraphEditor } from "@/app/_components/graph";

type PageParams = { params: { id: string } };

const Page: NextPage<PageParams> = async ({ params }: PageParams) => {
  const graphId = params.id;
  if (!graphId) return null;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-16 ">
        <GraphEditor graphId={graphId} />
      </div>
    </main>
  );
};

export default Page;
