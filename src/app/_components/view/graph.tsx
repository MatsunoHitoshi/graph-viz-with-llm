"use client";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { DocumentForm } from "../form/document-form";
import type { GraphDocument } from "@/server/api/routers/kg";
import { D3ForceGraph } from "../d3/force/graph";
import EXAMPLE_DATA from "../../const/example-graph.json";
import { Switch } from "@headlessui/react";
import { Toolbar } from "../toolbar/toolbar";
import { useRouter } from "next/navigation";
import { Button } from "../button/button";
import { api } from "@/trpc/react";
import { ShareIcon } from "../icons";
import { UrlCopy } from "../url-copy/url-copy";
import { useSearchParams } from "next/navigation";
import { useWindowSize } from "../../_hooks/use-window-size";

export const GraphExtraction = () => {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isUseExample, setIsUseExample] = useState<boolean>(false);
  const [graphDocument, setGraphDocument] = useState<GraphDocument | null>(
    isUseExample ? EXAMPLE_DATA : null,
  );
  const [isLinkFiltered, setIsLinkFiltered] = useState<boolean>(false);
  const [nodeSearchQuery, setNodeSearchQuery] = useState<string>("");
  const submitSourceDocumentWithGraph =
    api.sourceDocument.createWithGraphData.useMutation({});
  const router = useRouter();

  const searchParams = useSearchParams();
  const hasGraphData = searchParams.get("has-graph-data");

  const submit = (
    graphDocument: GraphDocument,
    fileName: string,
    documentUrl: string,
  ) => {
    submitSourceDocumentWithGraph.mutate(
      {
        name: fileName,
        url: documentUrl,
        dataJson: graphDocument,
      },
      {
        onSuccess: (res) => {
          router.push(`/graph/${res.id}`);
        },
        onError: (e) => {
          console.log(e);
        },
      },
    );
  };

  useEffect(() => {
    if (hasGraphData === "true") {
      const stGraph = localStorage.getItem("graphDocument");
      const fileName = localStorage.getItem("fileName");
      const url = localStorage.getItem("fileUrl");
      const graph = stGraph ? (JSON.parse(stGraph) as GraphDocument) : null;

      if (graph && fileName && url) submit(graph, fileName, url);

      localStorage.removeItem("graphDocument");
      localStorage.removeItem("fileName");
      localStorage.removeItem("fileUrl");
    }
  }, []);

  useEffect(() => {
    setGraphDocument(isUseExample ? EXAMPLE_DATA : null);
  }, [isUseExample]);

  const [innerWidth, innerHeight] = useWindowSize();
  const graphAreaWidth = (innerWidth ?? 100) - 18;
  const graphAreaHeight = (innerHeight ?? 300) - 130;

  return graphDocument ? (
    <div>
      <div className="h-full w-full p-2">
        <div className="flex h-full w-full flex-col divide-y divide-slate-400 overflow-hidden rounded-md border border-slate-400  text-slate-50">
          <Toolbar
            isLinkFiltered={isLinkFiltered}
            setIsLinkFiltered={setIsLinkFiltered}
            isUseExample={isUseExample}
            setIsUseExample={setIsUseExample}
            setNodeSearchQuery={setNodeSearchQuery}
            rightArea={
              <div className="flex flex-row items-center gap-2">
                {file && documentUrl && (
                  <Button
                    onClick={async () => {
                      if (session) {
                        submit(graphDocument, file.name, documentUrl);
                      } else {
                        console.log("Not sign in");
                        // save graph-data, file-url and file-name to local storage
                        localStorage.setItem(
                          "graphDocument",
                          JSON.stringify(graphDocument),
                        );
                        localStorage.setItem("fileName", file.name);
                        localStorage.setItem("fileUrl", documentUrl);
                        // then signIn
                        await signIn("google", {
                          callbackUrl: "/?has-graph-data=true",
                        });
                      }
                    }}
                  >
                    保存して共有する
                  </Button>
                )}
              </div>
            }
          />
          <D3ForceGraph
            width={graphAreaWidth}
            height={graphAreaHeight}
            graphDocument={graphDocument}
            isLinkFiltered={isLinkFiltered}
            nodeSearchQuery={nodeSearchQuery}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-4 text-slate-50">
      <DocumentForm
        file={file}
        setFile={setFile}
        setGraphDocument={setGraphDocument}
        setDocumentUrl={setDocumentUrl}
      />
      <div className="flex flex-row items-center gap-2">
        <div className="text-sm">サンプルデータを表示</div>
        <div>
          <Switch
            checked={isUseExample}
            onChange={setIsUseExample}
            className="group inline-flex h-6 w-11 items-center rounded-full bg-slate-400 transition data-[checked]:bg-orange-400"
          >
            <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
          </Switch>
        </div>
      </div>
    </div>
  );
};

export const GraphEditor = ({ graphId }: { graphId: string }) => {
  const { data: graphDocument } = api.documentGraph.getById.useQuery({
    id: graphId,
  });
  const [isLinkFiltered, setIsLinkFiltered] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nodeSearchQuery, setNodeSearchQuery] = useState<string>("");
  const [innerWidth, innerHeight] = useWindowSize();
  const graphAreaWidth = (innerWidth ?? 100) - 18;
  const graphAreaHeight = (innerHeight ?? 300) - 130;
  if (!graphDocument) return null;
  return (
    <div>
      <div className="h-full w-full p-2">
        <div className="flex h-full w-full flex-col divide-y divide-slate-400 overflow-hidden rounded-md border border-slate-400  text-slate-50">
          <Toolbar
            isLinkFiltered={isLinkFiltered}
            setIsLinkFiltered={setIsLinkFiltered}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setNodeSearchQuery={setNodeSearchQuery}
            rightArea={
              <div className="flex w-full max-w-[300px] flex-row items-center gap-4">
                <UrlCopy
                  messagePosition="inButton"
                  className="flex !h-8 !w-8 flex-row items-center justify-center px-0 py-0"
                >
                  <div className="h-4 w-4">
                    <ShareIcon height={16} width={16} color="white" />
                  </div>
                </UrlCopy>
                <div className="w-full truncate">
                  参照：
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full underline hover:no-underline"
                    href={graphDocument.sourceDocument.url}
                  >
                    {graphDocument.sourceDocument.name}
                  </a>
                </div>
              </div>
            }
          />
          {isEditing ? (
            <D3ForceGraph
              width={graphAreaWidth}
              height={graphAreaHeight}
              graphDocument={graphDocument.dataJson as GraphDocument}
              isLinkFiltered={isLinkFiltered}
              nodeSearchQuery={nodeSearchQuery}
            />
          ) : (
            <D3ForceGraph
              width={graphAreaWidth}
              height={graphAreaHeight}
              graphDocument={graphDocument.dataJson as GraphDocument}
              isLinkFiltered={isLinkFiltered}
              nodeSearchQuery={nodeSearchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
};