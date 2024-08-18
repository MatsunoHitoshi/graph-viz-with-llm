"use client";

import { useState } from "react";
import { Button } from "../button/button";

export const UrlCopy = () => {
  const isBrowser = typeof window !== "undefined";

  const [copyMessage, setCopyMessage] = useState<string>();

  const urlCopyHandler = async (url: string) => {
    if (!isBrowser) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage("URLをコピーしました");
    } catch {
      setCopyMessage("URLのコピーに失敗しました");
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button type="button" onClick={() => urlCopyHandler(location.href)}>
        このページのURLをコピーする
      </Button>
      {copyMessage ? <div className="text-sm">{copyMessage}</div> : <></>}
    </div>
  );
};
