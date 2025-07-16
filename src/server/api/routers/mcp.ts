import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";
import OpenAI from "openai";
import type { GraphDocument } from "./kg";
import type {
  NodeType,
  RelationshipType,
} from "@/app/_utils/kg/get-nodes-and-relationships-from-result";

function isGraphDocument(data: unknown): data is GraphDocument {
  return (
    typeof data === "object" &&
    data !== null &&
    "nodes" in data &&
    "relationships" in data &&
    Array.isArray((data as GraphDocument).nodes) &&
    Array.isArray((data as GraphDocument).relationships)
  );
}

// 出力データ構造のイメージ
interface ContextKnowledge {
  summary: string;
  nodeDetails: NodeType;
  relatedNodes: {
    relationship: RelationshipType;
    node: NodeType;
  }[];
  graphSubset: GraphDocument;
}

export const mcpRouter = createTRPCRouter({
  searchTopicSpacePublic: publicProcedure
    .input(
      z.object({
        topicSpaceId: z.string(),
        query: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { topicSpaceId, query } = input;
      const lowerCaseQuery = query.toLowerCase();

      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: {
          id: topicSpaceId,
          isDeleted: false,
        },
      });

      if (!topicSpace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TopicSpace not found or you don't have access.",
        });
      }

      if (!isGraphDocument(topicSpace.graphData)) {
        return []; // グラフデータがない場合は空配列を返す
      }

      const graphData = topicSpace.graphData;

      const matchedNodes = graphData.nodes.filter((node) => {
        // 名前の一致をチェック
        if (node.name.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
        // ラベルの一致をチェック
        if (node.label.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
        // プロパティの一致をチェック
        if (node.properties) {
          const propertiesString = JSON.stringify(
            node.properties,
          ).toLowerCase();
          if (propertiesString.includes(lowerCaseQuery)) {
            return true;
          }
        }
        return false;
      });

      return matchedNodes;
    }),

  getContextKnowledgeForNodePublic: publicProcedure
    .input(
      z.object({
        topicSpaceId: z.string(),
        nodeId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { topicSpaceId, nodeId } = input;

      // 1. 認可チェック と 2. DBからグラフデータを取得
      const topicSpace = await ctx.db.topicSpace.findFirst({
        where: {
          id: topicSpaceId,
          isDeleted: false,
        },
      });

      if (!topicSpace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "TopicSpace not found or you don't have access.",
        });
      }

      if (!isGraphDocument(topicSpace.graphData)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Graph data is missing or invalid in the TopicSpace.",
        });
      }

      const graphData = topicSpace.graphData;

      // 3. グラフデータを処理
      const mainNode = graphData.nodes.find((n) => String(n.id) === nodeId);
      if (!mainNode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Node not found in the graph.",
        });
      }

      const relatedRelationships = graphData.relationships.filter(
        (l) => String(l.sourceId) === nodeId || String(l.targetId) === nodeId,
      );

      const relatedNodeIds = new Set(
        relatedRelationships.map((l) =>
          String(l.sourceId) === nodeId ? l.targetId : l.sourceId,
        ),
      );

      const relatedNodesWithDetails = Array.from(relatedNodeIds)
        .map((id) => {
          const node = graphData.nodes.find((n) => n.id === id);
          const relationship = relatedRelationships.find(
            (l) => l.sourceId === id || l.targetId === id,
          );
          return { node, relationship };
        })
        .filter(
          (item): item is { node: NodeType; relationship: RelationshipType } =>
            !!item.node && !!item.relationship,
        );

      const responseData = {
        nodeDetails: mainNode,
        relatedNodes: relatedNodesWithDetails.map(({ node, relationship }) => ({
          node,
          relationship,
        })),
        graphSubset: {
          nodes: [mainNode, ...relatedNodesWithDetails.map(({ node }) => node)],
          relationships: relatedRelationships,
        },
      };

      // 4. LLMで要約を生成
      const openai = new OpenAI();

      let context = `主題: (name: ${mainNode.name}, label: ${mainNode.label}, properties: ${JSON.stringify(
        mainNode.properties,
      )})\n`;
      context += "関連情報:\n";
      responseData.relatedNodes.forEach(({ relationship }) => {
        const sourceNode = responseData.graphSubset.nodes.find(
          (n) => n.id === relationship.sourceId,
        );
        const targetNode = responseData.graphSubset.nodes.find(
          (n) => n.id === relationship.targetId,
        );
        context += `- (${sourceNode?.name})-[${relationship.type}]->(${targetNode?.name})\n`;
      });

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "あなたは美術の専門家です。与えられた主題と関連情報に基づいて、簡潔で分かりやすい解説文を日本語で生成してください。",
          },
          {
            role: "user",
            content: `以下の情報について、200字程度で解説してください。\n\n${context}`,
          },
        ],
        model: "gpt-4o-mini",
        temperature: 0.7,
      });

      const summary =
        completion.choices[0]?.message?.content ??
        "要約を生成できませんでした。";

      // 5. 指定された形式で返却
      const result: ContextKnowledge = {
        summary,
        nodeDetails: responseData.nodeDetails,
        relatedNodes: responseData.relatedNodes,
        graphSubset: responseData.graphSubset,
      };

      return result;
    }),
});
