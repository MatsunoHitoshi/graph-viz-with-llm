import { Switch } from "@headlessui/react";
import React from "react";
type ToolbarProps = {
  isLinkFiltered?: boolean;
  setIsLinkFiltered?: React.Dispatch<React.SetStateAction<boolean>>;
  isUseExample?: boolean;
  setIsUseExample?: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing?: boolean;
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>>;
  rightArea?: React.ReactNode;
};
export const Toolbar = ({
  isLinkFiltered,
  setIsLinkFiltered,
  isUseExample,
  setIsUseExample,
  isEditing,
  setIsEditing,
  rightArea,
}: ToolbarProps) => {
  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-4 p-2">
        {!!setIsEditing && (
          <div className="flex flex-row items-center gap-2">
            <div className="text-sm">編集モード</div>
            <div>
              <Switch
                checked={isEditing}
                onChange={setIsEditing}
                disabled={true}
                className="group inline-flex h-6 w-11 items-center rounded-full bg-slate-400 transition data-[checked]:bg-orange-400 data-[disabled]:bg-slate-200"
              >
                <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
              </Switch>
            </div>
          </div>
        )}
        {!!setIsLinkFiltered && (
          <div className="flex flex-row items-center gap-2">
            <div className="text-sm">Linkフィルタ</div>
            <div>
              <Switch
                checked={isLinkFiltered}
                onChange={setIsLinkFiltered}
                className="group inline-flex h-6 w-11 items-center rounded-full bg-slate-400 transition data-[checked]:bg-orange-400"
              >
                <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
              </Switch>
            </div>
          </div>
        )}
        {!!setIsUseExample && (
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
        )}
      </div>

      {!!rightArea && <>{rightArea}</>}
    </div>
  );
};
