import type { NextPage } from "next";
import { GraphExtraction } from "./_components/graph-extraction";
import { UrlCopy } from "./_components/url-copy/url-copy";

const Page: NextPage = async () => {
  // const session = await getServerAuthSession();
  return (
    <div>
      <div className="flex flex-col gap-8 pt-16 sm:hidden">
        <div className="flex flex-row items-center justify-center pt-[200px] text-center text-xl font-semibold">
          このアプリはスマートフォンの
          <br />
          画面サイズに対応していません😖
          <br />
          <br />
          PC・タブレットにてご利用ください🙇‍♂️
        </div>
        <div className="flex flex-row justify-center">
          <UrlCopy />
        </div>
      </div>
      <div className="hidden sm:block">
        <GraphExtraction />
      </div>
    </div>
  );
};

export default Page;
