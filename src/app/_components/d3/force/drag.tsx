import { drag } from "d3";
import type { Simulation, D3DragEvent } from "d3";
import * as d3 from "d3";
import type { CustomLinkType, CustomNodeType } from "./graph";

export const dragExtension = (
  simulation: Simulation<CustomNodeType, CustomLinkType>,
  //   setGraphNodes: React.Dispatch<React.SetStateAction<CustomNodeType[]>>,
  //   graphNodes: CustomNodeType[],
) => {
  // Reheat the simulation when drag starts, and fix the subject position.
  function dragStarted(
    event: D3DragEvent<SVGCircleElement, CustomNodeType, CustomNodeType>,
  ) {
    console.log("dragStarted");
    if (!event.active) simulation.alphaTarget(0.3).restart();
    console.log(event);
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
    // const draggedNode = event.subject;
    // console.log(event);
    // const newNodes = graphNodes.map((node) => {
    //   if (node.id == draggedNode.id) {
    //     return { fx: event.subject.x, fy: event.subject.y, ...node };
    //   } else return node;
    // });
    // setGraphNodes(newNodes);
  }

  // Update the subject (dragged node) position during drag.
  function dragged(
    event: D3DragEvent<SVGCircleElement, CustomNodeType, CustomNodeType>,
  ) {
    console.log("dragged");
    event.subject.fx = event.x;
    event.subject.fy = event.y;
    // const draggedNode = event.subject;
    // const newNodes = graphNodes.map((node) => {
    //   if (node.id == draggedNode.id) {
    //     console.log(event.x, ", ", event.y);
    //     return { fx: event.x, fy: event.y, ...node };
    //   } else return node;
    // });
    // setGraphNodes(newNodes);
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragEnded(
    event: D3DragEvent<SVGCircleElement, CustomNodeType, CustomNodeType>,
  ) {
    console.log("dragEnded");
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
    // const draggedNode = event.subject;
    // const newNodes = graphNodes.map((node) => {
    //   if (node.id == draggedNode.id) {
    //     return { fx: null, fy: null, ...node };
    //   } else return node;
    // });
    // setGraphNodes(newNodes);
  }
  d3.selectAll<Element, unknown>(".node").call(
    drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded),
  );
};
