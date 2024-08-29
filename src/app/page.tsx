import type { NextPage } from "next";
import { GraphExtraction } from "./_components/graph";

const Page: NextPage = async () => {
  // const session = await getServerAuthSession();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-16 ">
        <GraphExtraction />
      </div>
    </main>
  );
};

export default Page;
