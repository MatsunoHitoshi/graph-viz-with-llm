import type { DocumentResponse } from "@/app/const/types";
import { Modal } from "../modal/modal";
import {
  Input,
  Textarea,
  Field,
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import clsx from "clsx";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";

type TopicSpaceCreateModalProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const TopicSpaceCreateModal = ({
  isOpen,
  setIsOpen,
}: TopicSpaceCreateModalProps) => {
  const { data: session } = useSession();
  const { data: documents } = api.sourceDocument.getListBySession.useQuery();
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentResponse | null>(documents?.[0] ?? null);
  const [query, setQuery] = useState("");

  const filteredDocuments =
    query === ""
      ? documents
      : documents?.filter((document) => {
          return document.name.toLowerCase().includes(query.toLowerCase());
        }) ?? [];

  if (!filteredDocuments || !session) return null;

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="トピックスペースを作成">
      <Field>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold">トピック名</div>
            <Input
              name="name"
              type="text"
              className={clsx(
                "mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6",
                "focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-slate-400",
              )}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold">トピックの説明</div>
            <Textarea
              name="description"
              className={clsx(
                "mt-3 block w-full resize-none rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white",
                "focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-slate-400",
              )}
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold">ドキュメントを選択</div>
            <Combobox
              value={selectedDocument}
              onChange={setSelectedDocument}
              onClose={() => setQuery("")}
            >
              <ComboboxInput
                displayValue={(document: DocumentResponse) =>
                  document ? document.name : ""
                }
                onChange={(event) => setQuery(event.target.value)}
                className={clsx(
                  "w-full rounded-lg border-none bg-white/5 py-1.5 pl-3 pr-8 text-sm/6 text-white",
                  "focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-slate-400",
                )}
              />
              <ComboboxOptions
                anchor="bottom"
                className="border empty:invisible"
              >
                {filteredDocuments.map((document) => (
                  <ComboboxOption
                    key={document.id}
                    value={document}
                    className="data-[focus]:bg-blue-100"
                  >
                    {document.name}
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            </Combobox>
          </div>
        </div>
      </Field>
    </Modal>
  );
};
