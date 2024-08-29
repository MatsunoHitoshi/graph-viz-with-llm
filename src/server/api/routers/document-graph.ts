import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const DocumentGraphSchema = z.object({
  dataJson: z.object({
    nodes: z.array(z.any()),
    relationships: z.array(z.any()),
  }),
  sourceDocumentId: z.string(),
});

export const documentGraphRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log(input.id);
      return ctx.db.documentGraph.findFirst({where: {id: input.id}, include:{sourceDocument: true}});
    }),

  create: protectedProcedure
    .input(DocumentGraphSchema)
    .mutation(async ({ ctx, input }) => {
      const graph = ctx.db.documentGraph.create({
        data: {
          dataJson: input.dataJson,
          user: { connect: { id: ctx.session.user.id } },
          sourceDocument: { connect: { id: input.sourceDocumentId } },
        },
      });
      return graph
    }),
});
