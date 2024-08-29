"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DocumentForm } from "./form/document-form";
import type { GraphDocument } from "@/server/api/routers/kg";
import { D3ForceGraph } from "./d3/force/graph";
import EXAMPLE_DATA from "../const/example-graph.json";
import { Switch } from "@headlessui/react";
import { Toolbar } from "./toolbar/toolbar";
import { useRouter } from "next/navigation";
import { Button } from "./button/button";
import { api } from "@/trpc/react";
import { ShareIcon } from "./icons";
import { UrlCopy } from "./url-copy/url-copy";

export const GraphExtraction = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isUseExample, setIsUseExample] = useState<boolean>(false);
  const [graphDocument, setGraphDocument] = useState<GraphDocument | null>(
    isUseExample ? EXAMPLE_DATA : null,
  );

  useEffect(() => {
    setGraphDocument(isUseExample ? EXAMPLE_DATA : null);
  }, [isUseExample]);
  const [isLinkFiltered, setIsLinkFiltered] = useState<boolean>(false);
  const submitDocumentGraph = api.documentGraph.create.useMutation({});
  const submitSourceDocument = api.sourceDocument.create.useMutation({});
  const router = useRouter();
  const { data: session } = useSession();

  const submit = () => {
    if (!graphDocument || !file || !documentUrl) return;
    submitSourceDocument.mutate(
      {
        name: file.name,
        url: documentUrl,
      },
      {
        onSuccess: (res) => {
          submitDocumentGraph.mutate(
            {
              sourceDocumentId: res.id,
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
        },
        onError: (e) => {
          console.log(e);
        },
      },
    );
  };

  return graphDocument ? (
    <div>
      <Toolbar
        isLinkFiltered={isLinkFiltered}
        setIsLinkFiltered={setIsLinkFiltered}
        isUseExample={isUseExample}
        setIsUseExample={setIsUseExample}
        rightArea={
          <div className="flex flex-row items-center gap-2">
            {file && documentUrl && (
              <Button
                onClick={() => {
                  if (session) {
                    submit();
                  } else {
                    console.log("Not sign in");
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
        graphDocument={graphDocument}
        isLinkFiltered={isLinkFiltered}
      />
    </div>
  ) : (
    <div className="flex flex-col items-center gap-4">
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
  if (!graphDocument) return null;
  return (
    <div>
      <Toolbar
        isLinkFiltered={isLinkFiltered}
        setIsLinkFiltered={setIsLinkFiltered}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        rightArea={
          <div className="flex flex-row items-center gap-2">
            <UrlCopy
              messagePosition="inButton"
              className="flex h-8 w-8 flex-row items-center justify-center px-0 py-0"
            >
              <ShareIcon height={16} width={16} />
            </UrlCopy>
            <div className="mx-4">
              参照：
              <a
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
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
          graphDocument={graphDocument.dataJson as GraphDocument}
          isLinkFiltered={isLinkFiltered}
        />
      ) : (
        <D3ForceGraph
          graphDocument={graphDocument.dataJson as GraphDocument}
          isLinkFiltered={isLinkFiltered}
        />
      )}
    </div>
  );
};
