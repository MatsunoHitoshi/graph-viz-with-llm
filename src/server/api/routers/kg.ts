import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import {
  exportJson,
  writeFile,
  writeLocalFileFromUrl,
} from "@/app/_utils/sys/file";
import type {
  NodeDiffType,
  NodeType,
  RelationshipDiffType,
  RelationshipType,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";
import { textInspect } from "@/app/_utils/text/text-inspector";
import {
  attachGraphProperties,
  dataDisambiguation,
  fuseGraphs,
} from "@/app/_utils/kg/data-disambiguation";
import { env } from "@/env";
import { GraphChangeEntityType, GraphChangeRecordType } from "@prisma/client";
import { diffNodes, diffRelationships } from "@/app/_utils/kg/diff";
import { shapeGraphData } from "@/app/_utils/kg/shape";
import type { Extractor } from "@/server/lib/extractors/base";
import { AssistantsApiExtractor } from "@/server/lib/extractors/assistants";
import { LangChainExtractor } from "@/server/lib/extractors/langchain";
import { getNeighborNodes } from "@/app/_utils/kg/get-tree-layout-data";
// import type { Prisma } from "@prisma/client";
// import { GraphDataStatus } from "@prisma/client";
// import { stripGraphData } from "@/app/_utils/kg/data-strip";

const ExtractInputSchema = z.object({
  fileUrl: z.string().url(),
  extractMode: z.string().optional(),
  isPlaneTextMode: z.boolean(),
});

const TestInspectInputSchema = z.object({
  fileUrl: z.string().url(),
  isPlaneTextMode: z.boolean(),
});

const IntegrateGraphInputSchema = z.object({
  topicSpaceId: z.string(),
  graphDocument: z.object({
    nodes: z.array(z.any()),
    relationships: z.array(z.any()),
  }),
});

const GetRelatedNodesInputSchema = z.object({
  nodeId: z.number(),
  topicSpaceId: z.string(),
});

export type GraphDocument = {
  nodes: NodeType[];
  relationships: RelationshipType[];
};

export type NodeSchema = {
  entity: string;
  type: string;
};

export const kgRouter = createTRPCRouter({
  extractKG: publicProcedure
    .input(ExtractInputSchema)
    .mutation(async ({ input }) => {
      const { fileUrl, extractMode, isPlaneTextMode } = input;

      const localFilePath = await writeLocalFileFromUrl(
        fileUrl,
        `input.${isPlaneTextMode ? "txt" : "pdf"}`,
      );

      // SchemaExample: Nodes: [Person {age: integer, name: string}] Relationships: [Person, roommate, Person]
      // const schema = `
      // Nodes: [Artist {name: string, birthYear: integer}], [Museum {name: string, builtAt: integer}], [Curator {name: string, birthYear: integer}], [Exhibition {title: string, heldAt: integer}], [Critic {name: string, birthYear: integer}]
      // Relationships: [Artist, join, Exhibition], [Curator, direction, Exhibition], [Museum, host, Exhibition], [Critic, mention ,Artist]
      // `;
      const schema = {
        allowedNodes: [],
        allowedRelationships: [],
      };

      try {
        console.log("type: ", extractMode);
        const extractor: Extractor =
          extractMode === "langChain"
            ? new LangChainExtractor()
            : new AssistantsApiExtractor();
        const nodesAndRelationships = await extractor.extract(
          localFilePath,
          isPlaneTextMode,
          schema,
        );

        if (!nodesAndRelationships) {
          return {
            data: { graph: null, error: "グラフ抽出エラー" },
          };
        }
        const disambiguatedNodesAndRelationships = dataDisambiguation(
          nodesAndRelationships,
        );

        if (env.NODE_ENV === "development") {
          exportJson(
            JSON.stringify(nodesAndRelationships),
            "node-relationship.json",
          );
          exportJson(
            JSON.stringify(disambiguatedNodesAndRelationships),
            "disambiguated-node-relationship.json",
          );
        }

        return {
          data: { graph: disambiguatedNodesAndRelationships },
        };
      } catch (error) {
        return {
          data: { graph: null, error: "グラフ抽出エラー" },
        };
      }
    }),

  textInspect: publicProcedure
    .input(TestInspectInputSchema)
    .mutation(async ({ input }) => {
      const { fileUrl, isPlaneTextMode } = input;

      const localFilePath = await writeLocalFileFromUrl(
        fileUrl,
        `input.${isPlaneTextMode ? "txt" : "pdf"}`,
      );

      try {
        const documents = await textInspect(localFilePath, isPlaneTextMode);
        return {
          data: { documents: documents },
        };
      } catch (error) {
        return {
          data: {
            documents: null,
            error: `テキスト検査エラー: ${String(error)}`,
          },
        };
      }
    }),

  integrateGraph: protectedProcedure
    .input(IntegrateGraphInputSchema)
    .mutation(async ({ ctx, input }) => {
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: { id: input.topicSpaceId, isDeleted: false },
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

      const prevGraphData = topicSpace.graphData as GraphDocument;

      const updatedGraphData = await fuseGraphs({
        sourceGraph: input.graphDocument as GraphDocument,
        targetGraph: prevGraphData,
        labelCheck: false,
      });

      const newGraphWithProperties = attachGraphProperties(
        updatedGraphData,
        prevGraphData,
      );
      const shapedGraphData = shapeGraphData(newGraphWithProperties);

      if (!shapedGraphData) {
        throw new Error("Graph fusion failed");
      }

      const graphChangeHistory = await ctx.db.graphChangeHistory.create({
        data: {
          recordType: GraphChangeRecordType.TOPIC_SPACE,
          recordId: topicSpace.id,
          description: "グラフを追加しました",
          user: { connect: { id: ctx.session.user.id } },
        },
      });

      const nodeDiffs = diffNodes(prevGraphData.nodes, shapedGraphData.nodes);
      const relationshipDiffs = diffRelationships(
        prevGraphData.relationships,
        shapedGraphData.relationships,
      );
      const nodeChangeHistories = nodeDiffs.map((diff: NodeDiffType) => {
        return {
          changeType: diff.type,
          changeEntityType: GraphChangeEntityType.NODE,
          changeEntityId: String(diff.original?.id ?? diff.updated?.id),
          previousState: diff.original ?? {},
          nextState: diff.updated ?? {},
          graphChangeHistoryId: graphChangeHistory.id,
        };
      });
      const relationshipChangeHistories = relationshipDiffs.map(
        (diff: RelationshipDiffType) => {
          return {
            changeType: diff.type,
            changeEntityType: GraphChangeEntityType.EDGE,
            changeEntityId: String(diff.original?.id ?? diff.updated?.id),
            previousState: diff.original ?? {},
            nextState: diff.updated ?? {},
            graphChangeHistoryId: graphChangeHistory.id,
          };
        },
      );
      await ctx.db.nodeLinkChangeHistory.createMany({
        data: [...nodeChangeHistories, ...relationshipChangeHistories],
      });

      const updatedTopicSpace = await ctx.db.topicSpace.update({
        where: { id: input.topicSpaceId },
        data: { graphData: shapedGraphData },
      });

      return {
        data: updatedTopicSpace,
      };
    }),

  getRelatedNodes: publicProcedure
    .input(GetRelatedNodesInputSchema)
    .query(async ({ ctx, input }) => {
      const { nodeId, topicSpaceId } = input;

      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: { id: topicSpaceId, isDeleted: false },
      });
      if (!topicSpace) {
        throw new Error("TopicSpace not found");
      }

      const graphData = topicSpace.graphData as GraphDocument;
      const sourceNode = graphData.nodes.find((node) => node.id === nodeId) ?? {
        id: nodeId,
        name: "",
        label: "",
        properties: {},
      };
      const neighborNodes = getNeighborNodes(graphData, nodeId, "BOTH");
      const sourceLinks = graphData.relationships.filter(
        (l) => l.sourceId === nodeId || l.targetId === nodeId,
      );
      const neighborLinks = graphData.relationships.filter(
        (l) =>
          neighborNodes.some((node) => l.sourceId === node.id) &&
          neighborNodes.some((node) => l.targetId === node.id),
      );

      return {
        nodes:
          neighborNodes.length !== 0
            ? [sourceNode, ...neighborNodes]
            : [sourceNode],
        relationships: [...sourceLinks, ...neighborLinks],
      };
    }),

  // graphFusion: publicProcedure.mutation(async ({ ctx }) => {
  //   const updateFusionStatus = async (id: string, status: GraphDataStatus) => {
  //     await ctx.db.graphFusionQueue.update({
  //       where: { id: id },
  //       data: { status: status },
  //     });
  //   };
  //   const updateTopicGraph = async (
  //     id: string,
  //     graphData: Prisma.JsonObject,
  //   ) => {
  //     await ctx.db.topicSpace.update({
  //       where: { id: id },
  //       data: { graphData: stripGraphData(graphData as GraphDocument) },
  //     });
  //   };
  //   const createCompleteCheck = async (topicId: string) => {
  //     const topicSpace = await ctx.db.topicSpace.findFirst({
  //       where: { id: topicId, isDeleted: false },
  //       include: { graphFusionQueue: true },
  //     });
  //     if (
  //       !topicSpace?.graphFusionQueue.some((fusion) => {
  //         return (
  //           fusion.status ===
  //           (GraphDataStatus.QUEUED || GraphDataStatus.PROCESSING)
  //         );
  //       })
  //     ) {
  //       await ctx.db.topicSpace.update({
  //         where: { id: topicId },
  //         data: { graphDataStatus: GraphDataStatus.CREATED },
  //       });
  //     }
  //   };
  //   const fetchTopicSpace = async (id: string) => {
  //     const topicSpace = await ctx.db.topicSpace.findFirst({
  //       where: { id: id, isDeleted: false },
  //       include: { graphFusionQueue: true },
  //     });
  //     return topicSpace;
  //   };

  //   const graphFusionQueue = await ctx.db.graphFusionQueue.findMany({
  //     where: { status: GraphDataStatus.QUEUED },
  //     include: { topicSpace: true, additionalGraph: true },
  //     orderBy: { createdAt: "asc" },
  //   });

  //   for (const fusion of graphFusionQueue) {
  //     await updateFusionStatus(fusion.id, GraphDataStatus.PROCESSING);
  //     const topicSpace = await fetchTopicSpace(fusion.topicSpace.id);
  //     if (!topicSpace?.graphData) {
  //       await updateTopicGraph(
  //         fusion.topicSpace.id,
  //         fusion.additionalGraph.dataJson as GraphDocument,
  //       );
  //       await updateFusionStatus(fusion.id, GraphDataStatus.CREATED);
  //     } else {
  //       const graphData = await fuseGraphs(
  //         topicSpace.graphData as GraphDocument,
  //         fusion.additionalGraph.dataJson as GraphDocument,
  //       );
  //       if (!graphData) {
  //         await updateFusionStatus(fusion.id, GraphDataStatus.CREATION_FAILED);
  //       } else {
  //         await updateTopicGraph(fusion.topicSpace.id, graphData);
  //         await updateFusionStatus(fusion.id, GraphDataStatus.CREATED);
  //       }
  //     }

  //     await createCompleteCheck(fusion.topicSpace.id);
  //   }

  //   return {
  //     message: "complete",
  //     numberOfRecords: graphFusionQueue.length,
  //   };
  // }),
});
