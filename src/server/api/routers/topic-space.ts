import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

const TopicSpaceSchema = z.object({
    name: z.string(),
    image: z.string().url().optional(),
    description: z.string().optional(),
    documentId: z.string().optional(),
})

export const TopicSpaceRouter = createTRPCRouter({
    getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ctx, input }) => {
       return ctx.db.topicSpace.findFirst({ 
            where: { id: input.id },
            include: {
                sourceDocuments: true,
                admins: true,
                tags: true,
            }, 
        });
    }),

    getListBySession:  protectedProcedure.query(({ ctx }) => {
      const userId = ctx.session.user.id;
      return ctx.db.topicSpace.findMany({
            where: {admins: { some: { id: userId } }}, 
            include: {
                sourceDocuments: true,
                admins: true,
                tags: true,
                activities: true,
            }, 
            orderBy: { createdAt: "desc" } 
        })
    }),

  create: protectedProcedure
    .input(TopicSpaceSchema)
    .mutation(async ({ ctx, input }) => {
      const document = ctx.db.topicSpace.create({
        data: {
          name: input.name,
          image: input.image,
          description: input.description,
          sourceDocuments: { connect: {id: input.documentId}},
          admins: { connect: { id: ctx.session.user.id } },
        },
      });
      return document
    }),
})