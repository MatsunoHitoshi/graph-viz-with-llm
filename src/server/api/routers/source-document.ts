import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import type {
  NodeType,
  RelationshipType,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";

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
});

export const sourceDocumentRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.sourceDocument.findFirst({
        where: { id: input.id },
        include: { user: true },
      });
      if (document?.user.id !== ctx.session?.user.id) {
        throw new Error("Document not found");
      }
      return document;
    }),

  getByIdPublic: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.db.sourceDocument.findFirst({
        where: { id: input.id },
        include: { user: true },
      });
      if (!document) {
        throw new Error("Document not found");
      }
      return document;
    }),

  getListBySession: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.sourceDocument.findMany({
      where: { userId: userId },
      include: { graph: true },
      orderBy: { createdAt: "desc" },
    });
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
      return document;
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
      const sanitizedGraphData = {
        nodes: input.dataJson.nodes as NodeType[],
        relationships: input.dataJson.relationships as RelationshipType[],
      };
      const graph = await ctx.db.documentGraph.create({
        data: {
          dataJson: sanitizedGraphData,
          user: { connect: { id: ctx.session.user.id } },
          sourceDocument: { connect: { id: document.id } },
        },
      });
      return graph;
    }),
});
