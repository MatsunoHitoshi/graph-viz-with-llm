import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import type { GraphDocument } from "./kg";
import {
  attachGraphProperties,
  fuseGraphs,
} from "@/app/_utils/kg/data-disambiguation";
import type {
  TopicGraphFilterOption,
  TopicSpaceResponse,
} from "@/app/const/types";
import { stripGraphData } from "@/app/_utils/kg/data-strip";
import { nodePathSearch } from "@/app/_utils/kg/bfs";
import { neighborNodes } from "@/app/_utils/kg/get-tree-layout-data";
import type {
  NodeType,
  RelationshipType,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";
import { filterGraph, updateKg } from "@/app/_utils/kg/filter";

const TopicSpaceCreateSchema = z.object({
  name: z.string(),
  image: z.string().url().optional(),
  description: z.string().optional(),
  documentId: z.string().optional(),
});

const TopicSpaceGetSchema = z.object({
  id: z.string(),
  filterOption: z
    .object({
      type: z.string(),
      value: z.string(),
      cutOff: z.string().optional(),
      withBetweenNodes: z.boolean().optional(),
    })
    .optional(),
  withDocumentGraph: z.boolean().optional(),
});

const AttachDocumentSchema = z.object({
  documents: z.array(z.string()),
  id: z.string(),
});
const DetachDocumentSchema = z.object({
  documentId: z.string(),
  id: z.string(),
});

const UpdateGraphSchema = z.object({
  dataJson: z.object({
    nodes: z.array(z.any()),
    relationships: z.array(z.any()),
  }),
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

  const newGraphWithProperties = attachGraphProperties(
    newGraph,
    updatedTopicSpace.graphData as GraphDocument,
  );

  const sanitizedGraphData = stripGraphData(newGraphWithProperties);
  return sanitizedGraphData;
};

export const topicSpaceRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(TopicSpaceGetSchema)
    .query(async ({ ctx, input }) => {
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          sourceDocuments: {
            where: { isDeleted: false },
            include: { graph: input.withDocumentGraph },
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

      if (!!input.filterOption) {
        const filteredGraph = filterGraph(
          input.filterOption as TopicGraphFilterOption,
          topicSpace.graphData as GraphDocument,
          topicSpace.id,
        );
        const graphFilteredTopicSpace = {
          ...topicSpace,
          graphData: filteredGraph,
        };
        return graphFilteredTopicSpace;
      } else {
        return topicSpace;
      }
    }),

  getByIdPublic: publicProcedure
    .input(TopicSpaceGetSchema)
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
          admins: {
            select: {
              id: true,
            },
          },
          tags: true,
        },
      });
      if (!topicSpace) throw new Error("TopicSpace not found");

      if (!!input.filterOption) {
        const filteredGraph = filterGraph(
          input.filterOption as TopicGraphFilterOption,
          topicSpace.graphData as GraphDocument,
          topicSpace.id,
        );
        const graphFilteredTopicSpace = {
          ...topicSpace,
          graphData: filteredGraph,
        };
        return graphFilteredTopicSpace;
      } else {
        return topicSpace;
      }
    }),

  getPath: publicProcedure
    .input(z.object({ id: z.string(), startId: z.string(), endId: z.string() }))
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
      const graphData = topicSpace.graphData as GraphDocument;
      const links = graphData.relationships;

      const pathData = nodePathSearch(
        graphData,
        Number(input.startId),
        Number(input.endId),
      );

      const newLinks: RelationshipType[] = [];
      const nodesWithNeighbors = pathData.nodes
        .map((node) => {
          const neighbors = neighborNodes(graphData, node.id, false).filter(
            (n): n is NodeType => n !== undefined,
          );

          neighbors.forEach((neighbor) => {
            const additionalLinks = links.filter((link) => {
              return (
                (link.targetId === node.id && link.sourceId === neighbor.id) ||
                (link.targetId === neighbor.id && link.sourceId === node.id)
              );
            });
            newLinks.push(...additionalLinks);
          });

          return [...neighbors, node];
        })
        .flat();
      const uniqueNodes = [
        ...new Set(nodesWithNeighbors.map((node) => node.id)),
      ].map((id) => nodesWithNeighbors.find((node) => node.id === id));
      const uniqueLinks = [...new Set(newLinks.map((link) => link.id))].map(
        (id) => newLinks.find((link) => link.id === id),
      );

      return {
        ...topicSpace,
        graphData: {
          nodes: uniqueNodes,
          relationships: uniqueLinks,
        },
      };
    }),

  getListBySession: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.db.topicSpace.findMany({
      where: { admins: { some: { id: userId } }, isDeleted: false },
      select: {
        id: true,
        name: true,
        image: true,
        description: true,
        sourceDocuments: { where: { isDeleted: false } },
        admins: true,
        tags: true,
        activities: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
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
          graphData:
            stripGraphData(document?.graph?.dataJson as GraphDocument) ?? {},
        },
      });
      return topicSpace;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          admins: true,
        },
      });

      if (
        !topicSpace?.admins.some((admin) => {
          return admin.id === ctx.session.user.id;
        })
      ) {
        throw new Error("TopicSpace not found");
      }

      const updatedTopicSpace = ctx.db.topicSpace.update({
        where: { id: input.id },
        data: { isDeleted: true },
      });

      return updatedTopicSpace;
    }),

  attachDocuments: protectedProcedure
    .input(AttachDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          admins: true,
        },
      });

      if (
        !topicSpace?.admins.some((admin) => {
          return admin.id === ctx.session.user.id;
        })
      ) {
        throw new Error("TopicSpace not found");
      }

      // const topicSpace = await ctx.db.topicSpace.findFirst({
      //   where: { id: input.id },
      //   include: { sourceDocuments: true },
      // });
      const documentAttachedTopicSpace = await ctx.db.topicSpace.update({
        where: { id: input.id },
        data: {
          sourceDocuments: {
            connect: input.documents.map((docId) => ({ id: docId })),
          },
        },
        include: { sourceDocuments: { include: { graph: true } } },
      });

      // 単純な単語一致でグラフ統合処理を行う場合はキューを使う必要がない。
      const updatedGraphData = await updateGraphData(
        documentAttachedTopicSpace,
      );
      await ctx.db.graphChangeHistory.create({
        data: {
          recordType: GraphChangeRecordType.TOPIC_SPACE,
          recordId: documentAttachedTopicSpace.id,
          changeType: GraphChangeType.UPDATE,
          changeEntityType: GraphChangeEntityType.GRAPH,
          changeEntityId: documentAttachedTopicSpace.id,
          previousState: documentAttachedTopicSpace.graphData,
          nextState: updatedGraphData,
          description: "ドキュメントを追加しました",
          user: { connect: { id: ctx.session.user.id } },
        },
      });
      await ctx.db.topicSpace.update({
        where: { id: documentAttachedTopicSpace.id },
        data: { graphData: updatedGraphData },
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

      return documentAttachedTopicSpace;
    }),

  detachDocument: protectedProcedure
    .input(DetachDocumentSchema)
    .mutation(async ({ ctx, input }) => {
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          admins: true,
        },
      });

      if (
        !topicSpace?.admins.some((admin) => {
          return admin.id === ctx.session.user.id;
        })
      ) {
        throw new Error("TopicSpace not found");
      }

      const documentDetachedTopicSpace = await ctx.db.topicSpace.update({
        where: { id: input.id },
        data: {
          sourceDocuments: {
            disconnect: { id: input.documentId },
          },
        },
        include: { sourceDocuments: { include: { graph: true } } },
      });

      // 削除時のグラフアップデート
      const updatedGraphData = await updateGraphData(
        documentDetachedTopicSpace,
      );
      const graphChangeHistory = await ctx.db.graphChangeHistory.create({
        data: {
          recordType: GraphChangeRecordType.TOPIC_SPACE,
          recordId: documentDetachedTopicSpace.id,
          description: "ドキュメントを削除しました",
          user: { connect: { id: ctx.session.user.id } },
        },
      });

      // 生成
      const originalGraph = documentDetachedTopicSpace.graphData;
      const updatedGraph = updatedGraphData;

      const diffNodes = (
        originalNodes: NodeType[],
        updatedNodes: NodeType[],
      ) => {
        return originalNodes
          .filter(
            (originalNode) =>
              !updatedNodes.some(
                (updatedNode) => updatedNode.id === originalNode.id,
              ),
          )
          .concat(
            updatedNodes.filter(
              (updatedNode) =>
                !originalNodes.some(
                  (originalNode) => originalNode.id === updatedNode.id,
                ),
            ),
          );
      };

      const diffRelationships = (
        originalRelationships: RelationshipType[],
        updatedRelationships: RelationshipType[],
      ) => {
        return originalRelationships
          .filter(
            (originalRelationship) =>
              !updatedRelationships.some(
                (updatedRelationship) =>
                  updatedRelationship.id === originalRelationship.id,
              ),
          )
          .concat(
            updatedRelationships.filter(
              (updatedRelationship) =>
                !originalRelationships.some(
                  (originalRelationship) =>
                    originalRelationship.id === updatedRelationship.id,
                ),
            ),
          );
      };

      const nodeDiffs = diffNodes(originalGraph.nodes, updatedGraph.nodes);
      const relationshipDiffs = diffRelationships(
        originalGraph.relationships,
        updatedGraph.relationships,
      );

      nodeDiffs.forEach((diff) => {
        ctx.db.nodeLinkChangeHistory.create({
          data: {
            changeType: diff.type,
            changeEntityType: GraphChangeEntityType.NODE,
            changeEntityId: diff.id,
            previousState: diff.original,
            nextState: diff.updated,
            graphChangeHistory: { connect: { id: graphChangeHistory.id } },
          },
        });
      });

      relationshipDiffs.forEach((diff) => {
        ctx.db.nodeLinkChangeHistory.create({
          data: {
            changeType: diff.type,
            changeEntityType: GraphChangeEntityType.EDGE,
            changeEntityId: diff.id,
            previousState: diff.original,
            nextState: diff.updated,
            graphChangeHistory: { connect: { id: graphChangeHistory.id } },
          },
        });
      });

      // 生成終わり

      await ctx.db.topicSpace.update({
        where: { id: documentDetachedTopicSpace.id },
        data: { graphData: updatedGraphData },
      });

      return documentDetachedTopicSpace;
    }),

  updateGraph: protectedProcedure
    .input(UpdateGraphSchema)
    .mutation(async ({ ctx, input }) => {
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: {
          id: input.id,
          isDeleted: false,
        },
        include: {
          admins: true,
        },
      });

      if (
        !topicSpace?.admins.some((admin) => {
          return admin.id === ctx.session.user.id;
        })
      ) {
        throw new Error("TopicSpace not found");
      }

      const updatedGraph = updateKg(
        stripGraphData(input.dataJson),
        stripGraphData(topicSpace.graphData as GraphDocument),
      );

      await ctx.db.graphChangeHistory.create({
        data: {
          recordType: GraphChangeRecordType.TOPIC_SPACE,
          recordId: topicSpace.id,
          changeType: GraphChangeType.UPDATE,
          changeEntityType: GraphChangeEntityType.GRAPH,
          changeEntityId: topicSpace.id,
          previousState: topicSpace.graphData,
          nextState: updatedGraph,
          description: "グラフを更新しました",
          user: { connect: { id: ctx.session.user.id } },
        },
      });

      const updatedTopicSpace = await ctx.db.topicSpace.update({
        where: { id: input.id },
        data: {
          graphData: updatedGraph,
        },
        include: { sourceDocuments: { include: { graph: true } } },
      });

      return updatedTopicSpace;
    }),
});
