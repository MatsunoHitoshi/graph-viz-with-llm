import type { CustomNodeType } from "../d3/force/graph";
import { Button } from "../button/button";
import { useState } from "react";
import { NodePropertiesForm } from "../form/node-properties-form";
import { PropertyInfo } from "../d3/force/graph-info-panel";

export const NodePropertyList = ({
  node,
  isEditor,
  topicSpaceId,
  refetch,
}: {
  node: CustomNodeType;
  isEditor: boolean;
  topicSpaceId?: string | undefined;
  refetch?: (() => void) | undefined;
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <div className="text-sm">プロパティ</div>
        {isEditor ? (
          <Button
            className="!p-1 !text-sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "キャンセル" : "編集"}
          </Button>
        ) : (
          <></>
        )}
      </div>
      <div>
        {isEditor && isEditing && topicSpaceId && refetch ? (
          <div className="flex flex-col gap-1">
            <NodePropertiesForm
              node={node}
              topicSpaceId={topicSpaceId}
              refetch={refetch}
              setIsEditing={setIsEditing}
            />
          </div>
        ) : (
          <PropertyInfo data={node} />
        )}
      </div>
    </div>
  );
};
