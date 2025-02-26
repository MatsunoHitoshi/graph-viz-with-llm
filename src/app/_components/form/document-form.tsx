import { useRef, useState } from "react";
import type { SetStateAction } from "react";
import { FileUploader } from "../file-uploader/file-uploader";
import { Button } from "../button/button";
import { storageUtils } from "@/app/_utils/supabase/supabase";
import { BUCKETS } from "@/app/_utils/supabase/const";
import { api } from "@/trpc/react";
import type { GraphDocument } from "@/server/api/routers/kg";
import { Switch } from "@headlessui/react";
import { Textarea } from "../textarea";

type DocumentFormProps = {
  file: File | null;
  setFile: React.Dispatch<SetStateAction<File | null>>;
  setGraphDocument: React.Dispatch<SetStateAction<GraphDocument | null>>;
  setDocumentUrl: React.Dispatch<SetStateAction<string | null>>;
};

export const DocumentForm = ({
  file,
  setFile,
  setGraphDocument,
  setDocumentUrl,
}: DocumentFormProps) => {
  const [isPlaneTextMode, setIsPlaneTextMode] = useState<boolean>(false);
  const [text, setText] = useState<string>();
  const fileInputRef = useRef(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const extractKG = api.kg.extractKG.useMutation();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let fileUrl: string | undefined;
    const reader = new FileReader();

    const extract = (fileUrl: string) => {
      console.log("--fileUrl--");
      console.log(fileUrl);
      setDocumentUrl(fileUrl);

      extractKG.mutate(
        {
          fileUrl: fileUrl,
          extractMode: "langChain",
          isPlaneTextMode: isPlaneTextMode,
        },
        {
          onSuccess: (res) => {
            console.log("res client", res);
            setGraphDocument(res.data.graph);
            setIsExtracting(false);
          },
          onError: (e) => {
            console.log(e);
            setIsExtracting(false);
          },
        },
      );
    };

    if (isPlaneTextMode) {
      if (!text) {
        alert("テキストが入力されていません。");
        return;
      }
      console.log("planeTextMode");
      const textBlob = new Blob([text], { type: "text/plain; charset=utf-8" });
      const textFile = new File([textBlob], `input_${Date.now()}.txt`, {
        type: "text/plain; charset=utf-8",
      });
      setFile(textFile);
      reader.readAsDataURL(textFile);
      reader.onload = async () => {
        setIsExtracting(true);
        const base64Text = reader.result?.toString();
        console.log(base64Text);
        if (base64Text) {
          fileUrl = await storageUtils.uploadFromDataURL(
            base64Text,
            BUCKETS.PATH_TO_INPUT_TXT,
          );
          if (fileUrl) {
            extract(fileUrl);
          }
        } else {
          console.log("Failed to convert");
          setIsExtracting(false);
        }
      };
    } else {
      if (!file) {
        alert("ファイルが選択されていません。");
        return;
      }
      try {
        reader.readAsDataURL(file);
        reader.onload = async () => {
          setIsExtracting(true);
          const base64Data = reader.result?.toString();
          if (base64Data) {
            fileUrl = await storageUtils.uploadFromDataURL(
              base64Data,
              BUCKETS.PATH_TO_INPUT_PDF,
            );
            if (fileUrl) {
              extract(fileUrl);
            }
          } else {
            console.log("Failed to convert");
            setIsExtracting(false);
          }
        };
      } catch (error) {
        console.error("アップロード中にエラーが発生しました", error);
        alert("アップロード中にエラーが発生しました。");
      }
    }
  };

  return (
    <form
      encType="multipart/form-data"
      onSubmit={submit}
      className="flex w-full flex-col items-center gap-16"
    >
      <div className="flex flex-col items-center gap-8">
        <div className="text-3xl font-semibold">文書の内容を可視化</div>
        <div className="flex flex-col items-center gap-1">
          <div className="text-xl">
            pdfまたは手入力で文書をアップロードできます
          </div>
          <div className="text-sm text-orange-600">
            注意：機密情報・個人情報を含む文書は絶対にアップロードしないでください
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-4">
        {isPlaneTextMode ? (
          <>
            <Textarea
              placeholder="テキストを入力"
              autoFocus={true}
              className="min-h-[194px] w-full resize-none rounded-xl bg-slate-500 !p-4 text-base"
              defaultValue={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
            />
          </>
        ) : (
          <>
            <div className="w-full">
              <FileUploader
                name="target-file"
                inputRef={fileInputRef}
                setFile={setFile}
                file={file}
              />
            </div>
          </>
        )}

        <div className="flex flex-row items-center gap-2">
          <div className="text-sm">手入力モード</div>
          <div className="flex flex-row items-center gap-8">
            <Switch
              disabled={isExtracting}
              checked={isPlaneTextMode}
              onChange={setIsPlaneTextMode}
              className="group inline-flex h-6 w-11 items-center rounded-full bg-slate-400 transition data-[checked]:bg-orange-400"
            >
              <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
            </Switch>
            {((!!text && isPlaneTextMode) || (file && !isPlaneTextMode)) && (
              <div className="flex flex-row justify-end">
                <Button type="submit" isLoading={isExtracting}>
                  概念グラフを抽出する
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
