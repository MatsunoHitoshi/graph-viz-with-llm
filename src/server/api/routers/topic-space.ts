import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import type { GraphDocument } from "./kg";
import { fuseGraphs } from "@/app/_utils/kg/data-disambiguation";
import type { TopicSpaceResponse } from "@/app/const/types";

const TopicSpaceCreateSchema = z.object({
  name: z.string(),
  image: z.string().url().optional(),
  description: z.string().optional(),
  documentId: z.string().optional(),
});

const AttachDocumentSchema = z.object({
  documents: z.array(z.string()),
  id: z.string(),
});
const DetachDocumentSchema = z.object({
  documentId: z.string(),
  id: z.string(),
});
const updateGraphData = async (updatedTopicSpace: TopicSpaceResponse) => {
  let newGraph: GraphDocument = { nodes: [], relationships: [] };
  if (updatedTopicSpace.sourceDocuments) {
    for (const [
      index,
      document,
    ] of updatedTopicSpace.sourceDocuments.entries()) {
      if (index === 0) {
        newGraph = document.graph?.dataJson as GraphDocument;
      } else {
        newGraph = await fuseGraphs(
          newGraph,
          document.graph?.dataJson as GraphDocument,
        );
      }
    }
  }

  return newGraph;
};

export const topicSpaceRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          sourceDocuments: {
            where: { isDeleted: false },
            include: { graph: true },
          },
          admins: true,
          tags: true,
        },
      });

      if (
        !topicSpace?.admins.some((admin) => {
          return admin.id === ctx.session.user.id;
        })
      ) {
        throw new Error("TopicSpace not found");
      }

      return topicSpace;
    }),

  getByIdPublic: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          sourceDocuments: {
            where: { isDeleted: false },
            include: { graph: true },
          },
          admins: true,
          tags: true,
        },
      });
      if (!topicSpace) throw new Error("TopicSpace not found");
      return topicSpace;
    }),

  getListBySession: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.topicSpace.findMany({
      where: { admins: { some: { id: userId } }, isDeleted: false },
      include: {
        sourceDocuments: { where: { isDeleted: false } },
        admins: true,
        tags: true,
        activities: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(TopicSpaceCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.db.sourceDocument.findFirst({
        where: { id: input.documentId, isDeleted: false },
        include: { graph: true },
      });
      const topicSpace = ctx.db.topicSpace.create({
        data: {
          name: input.name,
          image: input.image,
          description: input.description,
          sourceDocuments: { connect: { id: input.documentId } },
          admins: { connect: { id: ctx.session.user.id } },
          graphData: document?.graph?.dataJson ?? {},
        },
      });
      return topicSpace;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const topicSpace = ctx.db.topicSpace.update({
        where: { id: input.id },
        data: { isDeleted: true },
      });

      return topicSpace;
    }),

  attachDocuments: protectedProcedure
    .input(AttachDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { id: ctx.session.user.id },
        include: { topicSpaces: true },
      });
      if (
        !user?.topicSpaces.some((topicSpace) => {
          return topicSpace.id === input.id;
        })
      ) {
        throw new Error("Can't Attach");
      }

      // const topicSpace = await ctx.db.topicSpace.findFirst({
      //   where: { id: input.id },
      //   include: { sourceDocuments: true },
      // });
      const updatedTopicSpace = await ctx.db.topicSpace.update({
        where: { id: input.id },
        data: {
          sourceDocuments: {
            connect: input.documents.map((docId) => ({ id: docId })),
          },
        },
        include: { sourceDocuments: { include: { graph: true } } },
      });

      // 単純な単語一致でグラフ統合処理を行う場合はキューを使う必要がない。
      await ctx.db.topicSpace.update({
        where: { id: updatedTopicSpace.id },
        data: { graphData: await updateGraphData(updatedTopicSpace) },
      });

      // グラフ統合の処理を工夫する際に統合処理のためのキューを使ったアップデートを行う場合に使用する。
      // const newDocuments = input.documents.filter((documentId) => {
      //   return !topicSpace?.sourceDocuments.some((document) => {
      //     return document.id === documentId;
      //   });
      // });
      // for (const documentId of newDocuments) {
      //   await ctx.db.graphFusionQueue.create({
      //     data: {
      //       topicSpace: { connect: { id: input.id } },
      //       additionalGraph: {
      //         connect: {
      //           id: updatedTopicSpace.sourceDocuments.find((document) => {
      //             return document.id === documentId;
      //           })?.graph?.id,
      //         },
      //       },
      //     },
      //   });
      // }
      // await ctx.db.topicSpace.update({
      //   where: { id: input.id },
      //   data: { graphDataStatus: GraphDataStatus.QUEUED },
      // });

      return updatedTopicSpace;
    }),

  detachDocument: protectedProcedure
    .input(DetachDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findFirst({
        where: { id: ctx.session.user.id },
        include: { topicSpaces: true },
      });
      if (
        !user?.topicSpaces.some((topicSpace) => {
          return topicSpace.id === input.id;
        })
      ) {
        throw new Error("Can't Detach");
      }
      const updatedTopicSpace = await ctx.db.topicSpace.update({
        where: { id: input.id },
        data: {
          sourceDocuments: {
            disconnect: { id: input.documentId },
          },
        },
        include: { sourceDocuments: { include: { graph: true } } },
      });

      // 削除時のグラフアップデート
      await ctx.db.topicSpace.update({
        where: { id: updatedTopicSpace.id },
        data: { graphData: await updateGraphData(updatedTopicSpace) },
      });

      return updatedTopicSpace;
    }),
});
