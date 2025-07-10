import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { GraphChangeRecordType } from "@prisma/client";

export const topicSpaceChangeHistoryRouter = createTRPCRouter({
  listByTopicSpaceId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const changeHistory = await ctx.db.graphChangeHistory.findMany({
        where: {
          recordId: input.id,
          recordType: GraphChangeRecordType.TOPIC_SPACE,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return changeHistory;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const changeHistory = await ctx.db.graphChangeHistory.findFirst({
        where: {
          id: input.id,
        },
        include: {
          nodeLinkChangeHistories: true,
        },
      });

      return changeHistory;
    }),
});
