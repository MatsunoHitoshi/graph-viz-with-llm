import type { NextPage } from "next";
import { Documents } from "@/app/_components/document/documents";

type PageParams = { params: { id: string } };

const Page: NextPage<PageParams> = async ({ params }: PageParams) => {
  const documentId = params.id;
  if (!documentId) return null;
  return (
    <main className="z-0 flex min-h-screen flex-col items-center justify-center bg-slate-800">
      <div className="flex h-screen w-full flex-col items-center  justify-center pt-16">
        <Documents id={documentId} />
      </div>
    </main>
  );
};

export default Page;
