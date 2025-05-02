import type { GraphDocument } from "@/server/api/routers/kg";
import React, { useEffect, useState } from "react";
import { SelectInput } from "../input/select-input";
import { nodePathSearch } from "@/app/_utils/kg/bfs";
import { ChevronRightIcon } from "../icons";

type SelectBoxOption = { id: string; label: string };

type RelationPathSearchProps = {
  defaultStartNodeId?: number;
  defaultEndNodeId?: number;
  graphData: GraphDocument;
  setPathData: React.Dispatch<React.SetStateAction<GraphDocument | undefined>>;
  pathData: GraphDocument | undefined;
};

export const RelationPathSearch = ({
  defaultStartNodeId,
  defaultEndNodeId,
  graphData,
  setPathData,
  pathData,
}: RelationPathSearchProps) => {
  const [startNode, setStartNode] = useState<SelectBoxOption>();
  const [endNode, setEndNode] = useState<SelectBoxOption>();
  const [isPathNotFound, setIsPathNotFound] = useState<boolean>(false);
  console.log(pathData);

  useEffect(() => {
    if (!!defaultEndNodeId && !!defaultStartNodeId) {
      const path = nodePathSearch(
        graphData,
        Number(defaultStartNodeId),
        Number(defaultEndNodeId),
      );
      setIsPathNotFound(path.nodes.length == 0 ? true : false);
      setPathData(path);
    }
    if (!!startNode && !!endNode) {
      const path = nodePathSearch(
        graphData,
        Number(startNode.id || defaultStartNodeId),
        Number(endNode.id || defaultEndNodeId),
      );
      setIsPathNotFound(path.nodes.length == 0 ? true : false);
      setPathData(path);
    }
  }, [startNode, endNode]);

  const options = graphData.nodes.map((node) => {
    return { id: String(node.id), label: node.name };
  });

  useEffect(() => {
    if (options && defaultStartNodeId && defaultEndNodeId) {
      setStartNode(
        options.find((o) => {
          return o.id === String(defaultStartNodeId);
        }),
      );
      setEndNode(
        options.find((o) => {
          return o.id === String(defaultEndNodeId);
        }),
      );
    }
  }, []);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs">つながりの検索</div>
      <div className="flex flex-row items-center justify-between gap-2">
        <SelectInput
          options={options}
          selected={startNode}
          setSelected={setStartNode}
          borderRed={isPathNotFound}
          placeholder="このノードから"
        />
        <div>
          <ChevronRightIcon height={14} width={14} color="white" />
        </div>

        <SelectInput
          options={options}
          selected={endNode}
          setSelected={setEndNode}
          borderRed={isPathNotFound}
          placeholder="このノードまで"
        />
      </div>
      <div className="flex flex-row items-center gap-2 text-xs">
        <div>距離: </div>
        <div>
          {pathData &&
            (pathData.nodes.length === 0 ? "-" : pathData.nodes.length - 1)}
        </div>
      </div>
    </div>
  );
};
