import type { ZoomBehavior } from "d3";
import React, { useEffect } from "react";
import { select, zoom } from "d3";

type D3ZoomProvider = {
  setCurrentScale: React.Dispatch<React.SetStateAction<number>>;
  setCurrentTransformX: React.Dispatch<React.SetStateAction<number>>;
  setCurrentTransformY: React.Dispatch<React.SetStateAction<number>>;
  currentScale: number;
  currentTransformX: number;
  currentTransformY: number;
  children: React.ReactNode;
};

export const D3ZoomProvider = ({
  setCurrentScale,
  setCurrentTransformX,
  setCurrentTransformY,
  currentScale,
  currentTransformX,
  currentTransformY,
  children,
}: D3ZoomProvider) => {
  useEffect(() => {
    const zoomScreen = select<Element, unknown>("#container");
    const zoomBehavior: ZoomBehavior<Element, unknown> = zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event: d3.D3ZoomEvent<Element, unknown>) => {
        const k = event.transform.k;
        const x = event.transform.x;
        const y = event.transform.y;
        setCurrentScale(k);
        setCurrentTransformX(x);
        setCurrentTransformY(y);
      });

    zoomScreen.call(zoomBehavior);
  }, []);
  return (
    <g
      transform={`translate(${currentTransformX}, ${currentTransformY})scale(${currentScale})`}
    >
      {children}
    </g>
  );
};
