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
import { getTextFromDocumentFile } from "@/app/_utils/text/text";

const CreateDocumentGraphSchema = z.object({
  dataJson: z.object({
    nodes: z.array(z.any()),
    relationships: z.array(z.any()),
  }),
  sourceDocumentId: z.string(),
});

const UpdateDocumentGraphSchema = z.object({
  id: z.string(),
  dataJson: z.object({
    nodes: z.array(z.any()),
    relationships: z.array(z.any()),
  }),
});

export const documentGraphRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log(input.id);
      const graph = await ctx.db.documentGraph.findFirst({
        where: { id: input.id, sourceDocument: { isDeleted: false } },
        include: { sourceDocument: true },
      });

      if (!graph) {
        throw new Error("DocumentGraph not found");
      }

      return {
        ...graph,
        sourceDocument: {
          ...graph.sourceDocument,
          text: await getTextFromDocumentFile(
            graph.sourceDocument.url,
            graph.sourceDocument.documentType,
          ),
        },
      };
    }),

  create: protectedProcedure
    .input(CreateDocumentGraphSchema)
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

  updateGraph: protectedProcedure
    .input(UpdateDocumentGraphSchema)
    .mutation(async ({ ctx, input }) => {
      console.log("@@@@updateGraph", input);
      const documentGraph = await ctx.db.documentGraph.findFirst({
        where: { id: input.id, sourceDocument: { isDeleted: false } },
      });

      if (!documentGraph || documentGraph.userId !== ctx.session.user.id) {
        throw new Error("DocumentGraph not found");
      }

      const sanitizedGraphData = {
        nodes: input.dataJson.nodes as NodeType[],
        relationships: input.dataJson.relationships as RelationshipType[],
      };
      const graph = await ctx.db.documentGraph.update({
        where: { id: input.id },
        data: { dataJson: sanitizedGraphData },
      });
      return graph;
    }),
});
