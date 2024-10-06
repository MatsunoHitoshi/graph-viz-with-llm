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
      return ctx.db.documentGraph.findFirst({
        where: { id: input.id, sourceDocument: { isDeleted: false } },
        include: { sourceDocument: true },
      });
    }),

  create: protectedProcedure
    .input(DocumentGraphSchema)
    .mutation(async ({ ctx, input }) => {
      const sanitizedGraphData = {
        nodes: input.dataJson.nodes as NodeType[],
        relationships: input.dataJson.relationships as RelationshipType[],
      };
      const graph = ctx.db.documentGraph.create({
        data: {
          dataJson: sanitizedGraphData,
          user: { connect: { id: ctx.session.user.id } },
          sourceDocument: { connect: { id: input.sourceDocumentId } },
        },
      });
      return graph;
    }),
});
