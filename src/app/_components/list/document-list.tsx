"use client";
import type { DocumentResponse } from "@/app/const/types";
import { Button } from "../button/button";
import { UrlCopy } from "../url-copy/url-copy";
import { GraphIcon, ShareIcon } from "../icons";
import { formatDate } from "@/app/_utils/date/format-date";
import { useRouter } from "next/navigation";
import { env } from "@/env";

type DocumentListProps = {
  documents: DocumentResponse[];
  start?: number;
  end?: number;
};
export const DocumentList = ({
  documents,
  start = 0,
  end = documents.length,
}: DocumentListProps) => {
  const router = useRouter();
  return (
    <div className="flex flex-col divide-y divide-slate-600 rounded-md border border-slate-400">
      {documents?.slice(start, end).map((document) => {
        return (
          <div
            key={document.id}
            className="flex flex-row items-center justify-between px-4 py-1"
          >
            <div className="flex w-max flex-row items-center gap-4 overflow-hidden">
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="truncate no-underline hover:underline"
                href={document.url}
              >
                {document.name}
              </a>
            </div>

            <div className="flex min-w-[216px] flex-row items-center justify-end gap-2">
              <Button
                className="!h-8 !w-8 bg-transparent !p-2 text-sm hover:bg-slate-50/10"
                onClick={() => {
                  router.push(`/graph/${document.graph?.id}`);
                }}
              >
                <GraphIcon height={16} width={16} color="white" />
              </Button>
              <UrlCopy
                messagePosition="inButton"
                className="flex !h-8 !w-8 flex-row items-center justify-center px-0 py-0"
                url={`${env.NEXT_PUBLIC_BASE_URL}/graph/${document.graph?.id}`}
              >
                <div className="h-4 w-4">
                  <ShareIcon height={16} width={16} color="white" />
                </div>
              </UrlCopy>
              <div className="w-[128px] text-right text-sm">
                {formatDate(document.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
