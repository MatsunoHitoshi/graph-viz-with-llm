import type { NextPage } from "next";
import { GraphExtraction } from "./_components/graph";
import { Suspense } from "react";

const Page: NextPage = async () => {
  // const session = await getServerAuthSession();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-16 ">
        <Suspense>
          <GraphExtraction />
        </Suspense>
      </div>
    </main>
  );
};

export default Page;
