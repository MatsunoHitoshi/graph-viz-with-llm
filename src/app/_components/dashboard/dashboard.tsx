"use client";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "../button/button";
import { useRouter } from "next/navigation";
import { formatDate } from "@/app/_utils/date/format-date";
import { ShareIcon } from "../icons";
import { UrlCopy } from "../url-copy/url-copy";
export const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: documents } = api.sourceDocument.getListBySession.useQuery();
  if (!session) return null;
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden rounded-md border border-slate-400 p-4 px-4 text-slate-50">
      <div className="flex flex-row items-center gap-2">
        <Image
          alt=""
          src={session.user.image ?? ""}
          height={36}
          width={36}
          className="rounded-full border border-slate-50"
        />
        <div className="text-xl font-semibold">{session.user.name}</div>
      </div>
      <div className="flex min-h-full w-full flex-col gap-4 overflow-y-scroll">
        <div className="text-xl font-semibold">最近のドキュメント</div>
        <div className="flex flex-col gap-1">
          {documents?.map((document) => {
            return (
              <div
                key={document.id}
                className="flex flex-row items-center justify-between rounded-md border border-slate-400 px-4 py-1"
              >
                <div className="flex flex-row items-center gap-4">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                    href={document.url}
                  >
                    {document.name}
                  </a>
                  <Button
                    className="bg-transparent px-2 py-1 text-sm hover:bg-slate-50/10"
                    onClick={() => {
                      router.push(`/graph/${document.graph?.id}`);
                    }}
                  >
                    グラフを見る
                  </Button>
                </div>

                <div className="flex flex-row items-center gap-4">
                  <UrlCopy
                    messagePosition="inButton"
                    className="flex h-8 w-8 flex-row items-center justify-center px-0 py-0"
                  >
                    <ShareIcon height={16} width={16} />
                  </UrlCopy>
                  <div>{formatDate(document.createdAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
