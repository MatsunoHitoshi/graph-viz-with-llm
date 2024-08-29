import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const SourceDocumentSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

const SourceDocumentWithGraphSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  dataJson: z.object({
    nodes: z.array(z.any()),
    relationships: z.array(z.any()),
  }),
})

export const sourceDocumentRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ctx, input }) => {
       return ctx.db.sourceDocument.findFirst({where: {id: input.id}});
    }),

    getListBySession:  protectedProcedure.query(({ ctx }) => {
      const userId = ctx.session.user.id;
      return ctx.db.sourceDocument.findMany({where: {userId: userId}, include: {graph: true}, orderBy: { createdAt: "desc" } })
    }),

  create: protectedProcedure
    .input(SourceDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const document = ctx.db.sourceDocument.create({
        data: {
          name: input.name,
          url: input.url,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
      return document
    }),

  createWithGraphData: protectedProcedure
    .input(SourceDocumentWithGraphSchema)
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.sourceDocument.create({
        data: {
          name: input.name,
          url: input.url,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
      const graph = await ctx.db.documentGraph.create({
        data: {
          dataJson: input.dataJson,
          user: { connect: { id: ctx.session.user.id } },
          sourceDocument: { connect: { id: document.id } },
        },
      });
      return graph
    }),
});
