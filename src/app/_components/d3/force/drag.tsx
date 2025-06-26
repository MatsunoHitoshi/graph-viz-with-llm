import { drag } from "d3";
import type { Simulation, D3DragEvent } from "d3";
import * as d3 from "d3";
import type { CustomLinkType, CustomNodeType } from "@/app/const/types";

export const dragExtension = (
  simulation: Simulation<CustomNodeType, CustomLinkType>,
) => {
  function dragStarted(
    event: D3DragEvent<SVGCircleElement, CustomNodeType, CustomNodeType>,
  ) {
    console.log("dragStarted");
    // if (!event.active) simulation.alphaTarget(0.3).restart();
    simulation.stop();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(
    event: D3DragEvent<SVGCircleElement, CustomNodeType, CustomNodeType>,
  ) {
    console.log("dragged");

    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragEnded(
    event: D3DragEvent<SVGCircleElement, CustomNodeType, CustomNodeType>,
  ) {
    console.log("dragEnded");

    // if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  d3.selectAll<Element, unknown>(".node").call(
    drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded),
  );
};
