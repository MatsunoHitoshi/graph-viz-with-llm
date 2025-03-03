import type { PropertyType } from "@/app/_utils/kg/get-nodes-and-relationships-from-result";
import type { CustomNodeType } from "../d3/force/graph";
import React, { useState } from "react";
import { Button } from "../button/button";
import { api } from "@/trpc/react";
import { PlusIcon, TrashIcon } from "../icons";

export const NodePropertiesForm = ({
  topicSpaceId,
  focusedNode,
  refetch,
  setIsEditing,
}: {
  topicSpaceId: string;
  focusedNode: CustomNodeType;
  refetch: () => void;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const updateProperty = api.topicSpaces.updateGraph.useMutation();
  const [properties, setProperties] = useState<PropertyType>(
    focusedNode.properties,
  );

  const submit = () => {
    updateProperty.mutate(
      {
        id: topicSpaceId,
        dataJson: {
          relationships: [],
          nodes: [{ ...focusedNode, properties: properties }],
        },
      },
      {
        onSuccess: (_res) => {
          refetch();
          setIsEditing(false);
        },
        onError: (e) => {
          console.log(e);
        },
      },
    );
  };
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(properties).map(([key, value], index) => {
        return (
          <div className="flex w-full flex-col gap-2" key={index}>
            <div className="flex w-full flex-row items-center gap-1">
              <input
                type="text"
                className="w-20 rounded-md bg-black/40 p-1 text-slate-50 backdrop-blur-2xl focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-slate-400"
                id={`key-${index}`}
                name={`key-${index}`}
                defaultValue={key}
                onChange={(e) => {
                  const prevKey = key;
                  const newKey = e.target.value;
                  const newProperties = { ...properties };
                  newProperties[newKey] = properties[prevKey] ?? "";
                  delete newProperties[prevKey];
                  setProperties(newProperties);
                }}
              />
              <div>:</div>
              <input
                type="text"
                className="w-20 rounded-md bg-black/40 p-1 text-slate-50 backdrop-blur-2xl focus:outline-none data-[focus]:outline-1 data-[focus]:-outline-offset-2 data-[focus]:outline-slate-400"
                id={`value-${index}`}
                name={`value-${index}`}
                defaultValue={String(value)}
                onChange={(e) => {
                  const newProperties = { ...properties };
                  newProperties[key] = e.target.value;
                  setProperties(newProperties);
                }}
              />
              <Button
                className="!ml-4 !p-1"
                onClick={() =>
                  setProperties((p) => {
                    const { [key]: _, ...rest } = p;
                    return rest;
                  })
                }
              >
                <TrashIcon height={18} width={18} />
              </Button>
            </div>
          </div>
        );
      })}

      <div className="flex flex-row items-center gap-2">
        <Button
          className="!p-1"
          onClick={() =>
            setProperties((p) => {
              console.log(p);
              return { ...p, [""]: "" };
            })
          }
        >
          <PlusIcon height={18} width={18} />
        </Button>
        <Button className="!text-small !p-1" onClick={submit}>
          保存
        </Button>
      </div>
    </div>
  );
};
