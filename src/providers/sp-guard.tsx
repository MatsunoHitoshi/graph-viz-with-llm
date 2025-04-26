"use client";
import { UrlCopy } from "@/app/_components/url-copy/url-copy";
import { usePathname } from "next/navigation";

export const SPGuardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pagePath = usePathname();
  const spAllowed = pagePath.startsWith("/about");
  return (
    <>
      {!spAllowed && (
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
            <UrlCopy>このページのURLをコピーする</UrlCopy>
          </div>
        </div>
      )}
      <div className={!spAllowed ? "hidden sm:block" : "block"}>{children}</div>
    </>
  );
};
