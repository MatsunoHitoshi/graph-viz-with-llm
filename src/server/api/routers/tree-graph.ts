import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getTreeLayoutData } from "@/app/_utils/kg/get-tree-layout-data";
import type { GraphDocument } from "./kg";

export const treeGraphRouter = createTRPCRouter({
  getByNodeId: publicProcedure
    .input(
      z.object({
        topicSpaceId: z.string(),
        nodeId: z.number(),
        isSource: z.boolean(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: { id: input.topicSpaceId },
      });

      if (!topicSpace?.graphData) throw new Error("GraphData not found");

      const treeData = getTreeLayoutData(
        topicSpace.graphData as GraphDocument,
        input.nodeId,
        input.isSource,
      );
      if (!treeData) throw new Error("TreeData not found");

      return treeData;
    }),
});
