import type { CustomLinkType, CustomNodeType } from "@/app/const/types";

const nodeHighlightedText = (
  text: string,
  searchTerms: { identifier: string; value: string | undefined }[],
) => {
  const filteredSearchTerms = searchTerms.filter(
    (term) => term.value !== undefined,
  );

  if (filteredSearchTerms.length === 0) {
    return text;
  }

  // すべての検索語を一つの正規表現にまとめる
  const escapedTerms = filteredSearchTerms.map(
    (term) => term.value?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") ?? "",
  );
  const combinedRegex = new RegExp(`(${escapedTerms.join("|")})`, "gi");

  // テキストを正規表現で分割して、マッチした部分をハイライト
  const parts = text.split(combinedRegex);

  return parts
    .map((part, index) => {
      // 空文字列の場合はスキップ
      if (part === "") return null;

      // 検索語にマッチするかチェック（大文字小文字を無視）
      const isMatch = filteredSearchTerms.some(
        (term) => term.value?.toLowerCase() === part.toLowerCase(),
      );

      if (isMatch) {
        return (
          <span key={index} className={`bg-orange-400 font-semibold`}>
            {part}
          </span>
        );
      }
      return part;
    })
    .filter(Boolean); // nullを除去
};

export const GraphSyncedText = ({
  focusedLink,
  focusedNode,
  text,
}: {
  focusedLink: CustomLinkType | undefined;
  focusedNode: CustomNodeType | undefined;
  text: string;
}) => {
  if (!focusedNode?.name && !focusedLink) {
    return <div className="whitespace-pre-wrap">{text}</div>;
  }

  const searchTerms = [
    { identifier: "node", value: focusedNode?.name },
    { identifier: "source", value: focusedLink?.sourceName },
    { identifier: "target", value: focusedLink?.targetName },
  ];

  console.log("@searchTerms : ", searchTerms);

  return (
    <div className="whitespace-pre-wrap">
      {nodeHighlightedText(text, searchTerms)}
    </div>
  );
};
