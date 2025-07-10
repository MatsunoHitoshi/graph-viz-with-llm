import { z } from "zod";
import { createMcpHandler } from "@vercel/mcp-adapter";
import { api } from "@/trpc/server";
import type { NextRequest } from "next/server";

// topicSpaceId ごとに専用のハンドラを生成するファクトリ関数
const createHandlerForTopicSpace = (
  topicSpaceId: string,
  topicSpaceName: string,
) => {
  return createMcpHandler(
    (server) => {
      server.tool(
        "search_art_topics",
        `ユーザーが${topicSpaceName}、について質問したり調査を依頼した際に必ず使用してください。情報源「${topicSpaceName}」からキーワードに一致する情報を検索し、ユーザーの質問に答えるための基礎情報を提供します。例えば『ピカソについて教えて』『シュルレアリスムとは？』のようなプロンプトで呼び出します。`,
        {
          query: z
            .string()
            .describe(
              "ユーザーの質問から抽出した、検索の核となるキーワード。例：『ピカソについて教えて』という質問なら 'ピカソ' を設定します。",
            ),
        },
        async ({ query }) => {
          try {
            const results = await api.mcp.searchTopicSpacePublic({
              topicSpaceId,
              query,
            });
            if (results.length === 0) {
              return {
                content: [
                  {
                    type: "text",
                    text: `「${query}」に一致する情報は見つかりませんでした。`,
                  },
                ],
              };
            }
            const textResponse =
              "以下の関連トピックが見つかりました。詳細を知りたいものを選択してください。\n" +
              results
                .map(
                  (node) =>
                    `- (ID: ${node.id}, name: ${node.name}, label: ${node.label}, properties: ${JSON.stringify(node.properties)})`,
                )
                .join("\n");

            return {
              content: [{ type: "text", text: textResponse }],
            };
          } catch (error) {
            console.error(error);
            return {
              content: [
                { type: "text", text: "検索中にエラーが発生しました。" },
              ],
            };
          }
        },
      );

      server.tool(
        "get_context_knowledge_for_node",
        `search_art_topicsで検索した特定のトピックについて、より詳細な情報を取得する際に使用します。ユーザーが検索結果の中から一つを選んで『もっと詳しく』と依頼した場合などに呼び出してください。`,
        {
          nodeId: z
            .string()
            .describe(
              "search_art_topicsで見つかったトピックのID。このツールを呼ぶ前に、必ずsearch_art_topicsを実行してIDを取得している必要があります。",
            ),
        },
        async ({ nodeId }) => {
          try {
            const result = await api.mcp.getContextKnowledgeForNodePublic({
              topicSpaceId,
              nodeId,
            });

            let textResponse = `## ${result.nodeDetails.name}についての解説\n\n`;
            textResponse += `${result.summary}\n\n`;
            textResponse += "### 関連情報\n";
            if (result.relatedNodes.length > 0) {
              textResponse += result.relatedNodes
                .map(({ node, relationship }) => {
                  return `- [${relationship.type}] - (ID: ${node.id}, name: ${node.name}, label: ${node.label}, properties: ${JSON.stringify(node.properties)})`;
                })
                .join("\n");
            } else {
              textResponse += "関連情報はありません。";
            }

            return {
              content: [{ type: "text", text: textResponse }],
            };
          } catch (error) {
            console.error(error);
            return {
              content: [
                {
                  type: "text",
                  text: "詳細情報の取得中にエラーが発生しました。",
                },
              ],
            };
          }
        },
      );
    },
    {},
    { basePath: `/api/topic-spaces/${topicSpaceId}` },
  );
};

// Next.js のルートハンドラ
const routeHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const topicSpaceId = params.id;
  if (!topicSpaceId) {
    return new Response("Topic Space ID is missing", { status: 400 });
  }
  const topicSpaceInfo = await api.topicSpaces.getSummaryByIdPublic({
    id: topicSpaceId,
  });
  if (!topicSpaceInfo) {
    return new Response("Topic space not found", { status: 404 });
  }
  const handler = createHandlerForTopicSpace(topicSpaceId, topicSpaceInfo.name);
  return handler(request);
};

export { routeHandler as GET, routeHandler as POST, routeHandler as DELETE };
