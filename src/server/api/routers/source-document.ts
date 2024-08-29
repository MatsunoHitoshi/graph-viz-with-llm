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
});
