import { createHeadlessEditor } from "@lexical/headless";
import { $convertFromMarkdownString } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";

import {
  ServerImageNode,
  ServerYouTubeNode,
  ServerTweetNode,
  ServerHorizontalRuleNode,
} from "./serverNodes";
import { SERVER_TRANSFORMERS } from "./serverTransformers";

export interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  format?: number;
  direction?: "ltr" | "rtl" | null;
  indent?: number;
  tag?: string;
  url?: string;
  target?: string;
  rel?: string;
  src?: string;
  altText?: string;
  height?: number;
  width?: number | "inherit";
  maxWidth?: number;
  videoID?: string;
  tweetID?: string;
  language?: string;
  rows?: LexicalNode[];
  checked?: boolean;
}

const ServerEditorNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  ServerHorizontalRuleNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  ServerImageNode,
  ServerYouTubeNode,
  ServerTweetNode,
];

function preprocessMarkdown(markdown: string): string {
  if (!markdown) return "";

  const processed = markdown
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\`/g, "`")
    .replace(/\\\\/g, "\\")
    .replace(/\\t/g, "\t");

  const codeBlockRegex = /```(\w*)(?:[^\n]*)\n([\s\S]*?)```/g;
  const replacements: { start: number; end: number; replacement: string }[] = [];
  let match;

  while ((match = codeBlockRegex.exec(processed)) !== null) {
    const [fullMatch, lang, content] = match;
    const startIndex = match.index;
    const endIndex = startIndex + fullMatch.length;

    const lines = content.split("\n");
    let startIdx = 0;
    let endIdx = lines.length;

    while (startIdx < endIdx && lines[startIdx].trim() === "") startIdx++;
    while (endIdx > startIdx && lines[endIdx - 1].trim() === "") endIdx--;

    const activeLines = lines.slice(startIdx, endIdx);

    if (activeLines.length === 0) {
      replacements.push({
        start: startIndex,
        end: endIndex,
        replacement: `\`\`\`${lang}\n\`\`\``,
      });
      continue;
    }

    let minIndent = Infinity;
    for (const line of activeLines) {
      const expandedLine = line.replace(/\t/g, "  ");
      const m = expandedLine.match(/^\s*/);
      const indent = m ? m[0].length : 0;
      if (indent < minIndent) minIndent = indent;
    }
    if (minIndent === Infinity) minIndent = 0;

    const dedented = activeLines
      .map((line) => {
        const expandedLine = line.replace(/\t/g, "  ");
        return expandedLine.length >= minIndent
          ? expandedLine.slice(minIndent)
          : expandedLine;
      })
      .join("\n");

    replacements.push({
      start: startIndex,
      end: endIndex,
      replacement: `\`\`\`${lang}\n${dedented}\n\`\`\``,
    });
  }

  let finalStr = processed;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { start, end, replacement } = replacements[i];
    finalStr = finalStr.slice(0, start) + replacement + finalStr.slice(end);
  }

  return finalStr;
}

/**
 * 서버측에서 마크다운을 Lexical JSON 노드 배열로 변환
 */
export function parseMarkdownToLexicalNodes(markdown: string): LexicalNode[] {
  const processedMarkdown = preprocessMarkdown(markdown);

  const editor = createHeadlessEditor({
    nodes: ServerEditorNodes,
    onError: (error) => {
      console.error("[parseMarkdownServer] Lexical error:", error);
    },
  });

  editor.update(
    () => {
      $convertFromMarkdownString(processedMarkdown, SERVER_TRANSFORMERS);
    },
    { discrete: true }
  );

  const editorState = editor.getEditorState();
  const json = editorState.toJSON();

  return (json.root?.children as LexicalNode[]) || [];
}
