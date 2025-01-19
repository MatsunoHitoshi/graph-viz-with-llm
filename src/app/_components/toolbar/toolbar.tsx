import { Input, Switch } from "@headlessui/react";
import clsx from "clsx";
import React from "react";
type ToolbarProps = {
  isLinkFiltered?: boolean;
  setIsLinkFiltered?: React.Dispatch<React.SetStateAction<boolean>>;
  isUseExample?: boolean;
  setIsUseExample?: React.Dispatch<React.SetStateAction<boolean>>;
  isEditing?: boolean;
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>>;
  setNodeSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
  rightArea?: React.ReactNode;
  setSourceTargetSwitch?: React.Dispatch<React.SetStateAction<boolean>>;
  sourceTargetSwitch?: boolean;
};
export const Toolbar = ({
  isLinkFiltered,
  setIsLinkFiltered,
  isUseExample,
  setIsUseExample,
  isEditing,
  setIsEditing,
  setNodeSearchQuery,
  rightArea,
  setSourceTargetSwitch,
  sourceTargetSwitch,
}: ToolbarProps) => {
  return (
    <div className="flex h-[46px] w-full flex-row items-center justify-between">
      <div className="flex w-full flex-row items-center gap-4">
        {!!setIsEditing && (
          <div className="flex flex-row items-center gap-2">
            <div className="text-sm">編集モード</div>
            <div>
              <Switch
                checked={isEditing}
                onChange={setIsEditing}
                disabled={true}
                className="group inline-flex h-6 w-11 items-center rounded-full bg-slate-500 transition data-[checked]:bg-orange-400 data-[disabled]:bg-slate-700"
              >
                <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
              </Switch>
            </div>
          </div>
        )}
        {!!setIsLinkFiltered && (
          <div className="flex flex-row items-center gap-2">
            <div className="truncate text-sm">リンクフィルタ</div>
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
        {!!setSourceTargetSwitch && (
          <div className="flex flex-row items-center gap-2">
            <div className="truncate text-sm">外方向への繋がり</div>
            <div>
              <Switch
                checked={sourceTargetSwitch}
                onChange={setSourceTargetSwitch}
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
        {!!setNodeSearchQuery && (
          <Input
            type="text"
            placeholder="ノードを検索"
            className={clsx(
              "block w-full max-w-[300px] rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6",
              "focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-slate-400",
            )}
            onChange={(e) => {
              setNodeSearchQuery(e.target.value);
            }}
          />
        )}
      </div>

      {!!rightArea && <>{rightArea}</>}
    </div>
  );
};
