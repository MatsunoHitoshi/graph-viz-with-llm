"use client";
import { useEffect, useState } from "react";
import { DocumentForm } from "./form/document-form";
import type { GraphDocument } from "@/server/api/routers/kg";
import { D3ForceGraph } from "./d3/force/graph";
import data from "../const/example-graph.json";
import { Switch } from "@headlessui/react";

export const GraphExtraction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUseExample, setIsUseExample] = useState<boolean>(false);
  const [graphDocument, setGraphDocument] = useState<GraphDocument | null>(
    isUseExample ? data : null,
  );

  useEffect(() => {
    setGraphDocument(isUseExample ? data : null);
  }, [isUseExample]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 pt-16 ">
        {graphDocument ? (
          <D3ForceGraph
            graphDocument={graphDocument}
            isUseExample={isUseExample}
            setIsUseExample={setIsUseExample}
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <DocumentForm
              file={file}
              setFile={setFile}
              setGraphDocument={setGraphDocument}
            />
            <div className="flex flex-row items-center gap-2">
              <div className="text-sm">サンプルデータを表示</div>
              <div>
                <Switch
                  checked={isUseExample}
                  onChange={setIsUseExample}
                  className="group inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition data-[checked]:bg-orange-400"
                >
                  <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
                </Switch>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
