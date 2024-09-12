import { useRef, useState } from "react";
import type { SetStateAction } from "react";
import { FileUploader } from "../file-uploader/file-uploader";
import { Button } from "../button/button";
import { storageUtils } from "@/app/_utils/supabase/supabase";
import { BUCKETS } from "@/app/_utils/supabase/const";
import { api } from "@/trpc/react";
import type { GraphDocument } from "@/server/api/routers/kg";

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
  const fileInputRef = useRef(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const extractKG = api.kg.extractKG.useMutation();

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      alert("ファイルが選択されていません。");
      return;
    }

    try {
      console.log("submitting");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        setIsExtracting(true);
        const base64Data = reader.result?.toString();
        if (base64Data) {
          console.log("--data--");
          console.log(base64Data);
          const fileUrl = await storageUtils.uploadFromDataURL(
            base64Data,
            BUCKETS.PATH_TO_INPUT_PDF,
          );
          console.log("--fileUrl--");
          console.log(fileUrl);
          setDocumentUrl(fileUrl);
          extractKG.mutate(
            { fileUrl: fileUrl, mode: "langChain" },
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
        } else {
          console.log("File content not found");
          setIsExtracting(false);
        }
      };
    } catch (error) {
      console.error("アップロード中にエラーが発生しました", error);
      alert("アップロード中にエラーが発生しました。");
    }
  };

  return (
    <form
      encType="multipart/form-data"
      onSubmit={submit}
      className="flex w-full flex-col items-center gap-4 "
    >
      <div className="flex flex-col items-center gap-2">
        <div className="text-xl font-semibold">
          文書データをpdfでアップロードしてください
        </div>
        <div className="font-xs text-orange-600">
          注意：機密情報・個人情報を含む文書は絶対にアップロードしないでください。
        </div>
      </div>

      <div className="w-full max-w-96">
        <FileUploader
          name="target-file"
          inputRef={fileInputRef}
          setFile={setFile}
          file={file}
        />
      </div>
      {file && (
        <div className="flex flex-row justify-end">
          <Button type="submit" isLoading={isExtracting}>
            関係性を抽出する
          </Button>
        </div>
      )}
    </form>
  );
};
