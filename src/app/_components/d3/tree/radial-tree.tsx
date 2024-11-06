"use client";
import React, { useEffect, useState } from "react";
import {
  select,
  hierarchy,
  ascending,
  tree,
  linkRadial,
  selectAll,
  type HierarchyPointNode,
} from "d3";
import { D3ZoomProvider } from "../zoom";
import type { TreeNode } from "@/app/const/types";
import type { GraphDocument } from "@/server/api/routers/kg";
import { useRouter } from "next/navigation";

type D3RadialTreeProps = {
  width: number;
  height: number;
  data: TreeNode;
  nodeSearchQuery: string;
  selectedGraphData?: GraphDocument | null;
  treeScale: number;
};

export const D3RadialTree = ({
  width,
  height,
  data,
  nodeSearchQuery,
  selectedGraphData,
  treeScale,
}: D3RadialTreeProps) => {
  const [currentScale, setCurrentScale] = useState<number>(1);
  const [currentTransformX, setCurrentTransformX] = useState<number>(0);
  const [currentTransformY, setCurrentTransformY] = useState<number>(0);
  const [labelFontSize, setLabelFontSize] = useState<number>(15);
  const [focusedNode, setFocusedNode] = useState<TreeNode>();
  const router = useRouter();
  const rootPath = location.pathname
    .split("/")
    .filter((item) => item !== location.pathname.split("/").pop())
    .join("/");
  // const [focusedLink, setFocusedLink] = useState<>();

  useEffect(() => {
    const radius = Math.min(width, height) / 2;

    const isSelected = (name: string) => {
      return selectedGraphData?.nodes.some((node) => {
        return node.name === name;
      });
    };
    const inSelected = (d: HierarchyPointNode<TreeNode>) =>
      selectedGraphData
        ? isSelected(d.data.name)
          ? "whitesmoke"
          : "#324557"
        : d.children
          ? "whitesmoke"
          : "#aaa";

    const d3Tree = tree<TreeNode>()
      .size([2 * Math.PI, radius])
      .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth);

    const svg = select("#radial-tree");
    // .append("g")
    // .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const root = d3Tree(
      hierarchy(data).sort((a, b) => ascending(a.data.name, b.data.name)),
    );

    // Append links.
    svg
      .append("g")
      .selectAll()
      .data(root.links())
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 2.5)
      .attr("class", "cursor-pointer")
      .attr(
        "d",
        linkRadial()
          .angle((d) => {
            const data = d as unknown as HierarchyPointNode<TreeNode>;
            return data.x;
          })
          .radius((d) => {
            const data = d as unknown as HierarchyPointNode<TreeNode>;
            return data.y + treeScale * data.depth + 1;
          }) as unknown as [number, number],
      );

    // Append nodes.
    svg
      .append("g")
      .selectAll()
      .data(root.descendants())
      .join("circle")
      .attr("class", "node cursor-pointer")
      .attr("stroke", (d) => {
        return !!nodeSearchQuery &&
          nodeSearchQuery !== "" &&
          d.data.name
            .toLocaleLowerCase()
            .includes(nodeSearchQuery.toLowerCase())
          ? "yellow"
          : "none";
      })
      .attr("stroke-width", 2.5)
      .attr(
        "transform",
        (d) =>
          `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y + treeScale * d.depth + 1},0)`,
      )
      .attr("fill", (d) => {
        const isFocused = focusedNode?.id === d.data.id;
        return isFocused ? "#ef7234" : inSelected(d);
      })
      .attr("r", (d) => 16 - 3 * (d.depth + 1))
      .on("click", (e, d) => {
        console.log(focusedNode);
        if (d.data.id === focusedNode?.id) {
          setFocusedNode(undefined);
          router.push(`${rootPath}/${focusedNode.id}`);
        } else {
          setFocusedNode(d.data);
          console.log(d.data);
        }
      });

    // Append labels.
    svg
      .append("g")
      // .attr("stroke-linejoin", "round")
      // .attr("stroke-width", 3)
      // .attr("stroke", "white")
      .selectAll()
      .data(root.descendants())
      .join("text")
      .attr("class", "label")
      .attr(
        "transform",
        (d) =>
          `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y + treeScale * d.depth + 1},0) rotate(${d.x >= Math.PI ? 180 : 0})`,
      )
      .attr("dy", "0.31em")
      .attr("x", (d) => (d.x < Math.PI === !d.children ? 15 : -15))
      .attr("text-anchor", (d) =>
        d.x < Math.PI === !d.children ? "start" : "end",
      )
      .attr("paint-order", "stroke")
      .attr("fill", "currentColor")
      .attr("color", (d) => {
        return inSelected(d);
      })
      .text((d) => d.data.name);

    return () => {
      const svg = select("#radial-tree");
      svg.selectAll("*").remove();
    };
  }, [nodeSearchQuery, focusedNode, selectedGraphData, data, treeScale]);

  useEffect(() => {
    if (currentScale > 3) {
      setLabelFontSize(8);
    } else if (currentScale > 2) {
      setLabelFontSize(12);
    } else {
      setLabelFontSize(16);
    }
  }, [currentScale]);
  useEffect(() => {
    selectAll(".label").attr("font-size", labelFontSize);
  }, [labelFontSize]);

  return (
    <div className="flex flex-col">
      <div className={`h-[${String(height)}px] w-[${String(width)}px]`}>
        <svg
          id="container"
          width={width}
          height={height}
          viewBox={`0 0 ${String(width)} ${String(height)}`}
        >
          <D3ZoomProvider
            setCurrentScale={setCurrentScale}
            setCurrentTransformX={setCurrentTransformX}
            setCurrentTransformY={setCurrentTransformY}
            currentScale={currentScale}
            currentTransformX={currentTransformX}
            currentTransformY={currentTransformY}
          >
            <g
              id="radial-tree"
              transform={`translate(${width / 2}, ${height / 2})`}
            ></g>
          </D3ZoomProvider>
        </svg>
      </div>
    </div>
  );
};
