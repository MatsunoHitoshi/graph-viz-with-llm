import type { GraphDocument } from "@/server/api/routers/kg";
import React, { useEffect, useState } from "react";
import { SelectInput } from "../input/select-input";
import { directionalBfs, nonDirectionalBfs } from "@/app/_utils/kg/bfs";
import { ChevronRightIcon } from "../icons";

type SelectBoxOption = { id: string; label: string };

type RelationPathSearchProps = {
  graphData: GraphDocument;
  setPathData: React.Dispatch<React.SetStateAction<GraphDocument | undefined>>;
  pathData: GraphDocument | undefined;
};

export const RelationPathSearch = ({
  graphData,
  setPathData,
  pathData,
}: RelationPathSearchProps) => {
  const [startNode, setStartNode] = useState<SelectBoxOption>();
  const [endNode, setEndNode] = useState<SelectBoxOption>();
  const [isPathNotFound, setIsPathNotFound] = useState<boolean>(false);
  console.log(pathData);

  useEffect(() => {
    if (!!startNode && !!endNode) {
      const isReached = (path: GraphDocument) => {
        const firstNode = path.nodes[0];
        const lastNode = path.nodes[path.nodes.length - 1];
        return (
          firstNode?.id === Number(startNode.id) &&
          lastNode?.id === Number(endNode.id)
        );
      };
      const directionalResult = directionalBfs(
        graphData,
        Number(startNode.id),
        Number(endNode.id),
      );
      console.log("directional:", directionalResult);
      const nonDirectionalResult = nonDirectionalBfs(
        graphData,
        Number(startNode.id),
        Number(endNode.id),
      );
      console.log("nonDirectional:", nonDirectionalResult);

      if (isReached(directionalResult) && isReached(nonDirectionalResult)) {
        setIsPathNotFound(false);
        setPathData(
          directionalResult.nodes.length <= nonDirectionalResult.nodes.length
            ? directionalResult
            : nonDirectionalResult,
        );
      } else if (
        !isReached(directionalResult) &&
        !isReached(nonDirectionalResult)
      ) {
        setIsPathNotFound(true);
        console.log("path not found");
        setPathData({ nodes: [], relationships: [] });
      } else {
        setIsPathNotFound(false);
        setPathData(
          isReached(directionalResult)
            ? directionalResult
            : nonDirectionalResult,
        );
      }
    }
  }, [startNode, endNode]);

  const options = graphData.nodes.map((node) => {
    return { id: String(node.id), label: node.name };
  });
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs">経路の検索</div>
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
          {pathData?.relationships.length === 0
            ? "-"
            : pathData?.relationships.length}
        </div>
      </div>
    </div>
  );
};
