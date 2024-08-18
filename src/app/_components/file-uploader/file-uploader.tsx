import type { LegacyRef } from "react";
import { Button } from "../button/button";
type FileUploaderProps = {
  name: string;
  inputRef: LegacyRef<HTMLInputElement>;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  file: File | null;
};

export const FileUploader = ({
  name,
  inputRef,
  setFile,
  file,
}: FileUploaderProps) => {
  return (
    <div className="flex min-h-[130px] w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-200 p-4">
      {/* <div className="text-lg font-semibold line-through">
        ここにファイルをドロップ
      </div>
      <div className="text-base">または</div> */}
      <input
        type="file"
        id="file-upload"
        name={name}
        accept="application/pdf"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        ref={inputRef}
      />
      <div className="flex flex-col items-center gap-1">
        <Button
          id="fileSelect"
          onClick={() => {
            if (typeof window !== "undefined") {
              const fileElem = document.getElementById("file-upload");
              fileElem?.click();
            }
          }}
        >
          ファイルをアップロード
        </Button>
        <div className="text-xs">ファイルサイズ上限：50MB</div>
      </div>

      <div className="font-semibold">{file?.name}</div>
    </div>
  );
};
