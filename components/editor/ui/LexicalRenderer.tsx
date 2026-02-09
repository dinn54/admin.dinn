"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useMemo } from "react";
import { EditorNodes } from "../nodes";
import theme from "../theme";
import CodeHighlightPlugin from "../plugins/code-highlight-plugin";
import MarkdownInitializerPlugin from "../plugins/MarkdownInitializerPlugin";
import { CUSTOM_TRANSFORMERS } from "../markdown-transformers";
import OpenLinksInNewTabPlugin from "../plugins/OpenLinksInNewTabPlugin";

interface LexicalRendererProps {
  markdown: string;
}

export default function LexicalRenderer({ markdown }: LexicalRendererProps) {
  const initialConfig = {
    namespace: "LexicalViewer",
    theme,
    onError: (error: Error) => console.error(error),
    nodes: EditorNodes,
    editable: false,
  };

  // Synchronous formatting using manual dedent logic
  const formattedMarkdown = useMemo(() => {
    if (!markdown) return "";

    // 1. Unescape basic characters & Normalize
    const processed = markdown
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\`/g, "`")
      .replace(/\\\\/g, "\\")
      .replace(/\\t/g, "\t"); // Keep tabs initially to handle them in logic

    // 2. Identify and format code blocks
    const codeBlockRegex = /```(\w*)(?:[^\n]*)\n([\s\S]*?)```/g;

    const replacements: {
      start: number;
      end: number;
      replacement: string;
    }[] = [];
    let match;

    while ((match = codeBlockRegex.exec(processed)) !== null) {
      const [fullMatch, lang, content] = match;
      const startIndex = match.index;
      const endIndex = startIndex + fullMatch.length;

      // Manual dedent logic
      const lines = content.split("\n");

      // Determine invalid first/last lines (empty)
      // We don't shift/pop immediately to preserve line count if needed,
      // but for code blocks, stripping surrounding empty lines is standard.
      let startIdx = 0;
      let endIdx = lines.length;

      while (startIdx < endIdx && lines[startIdx].trim() === "") {
        startIdx++;
      }
      while (endIdx > startIdx && lines[endIdx - 1].trim() === "") {
        endIdx--;
      }

      const activeLines = lines.slice(startIdx, endIdx);

      // Reset if no content
      if (activeLines.length === 0) {
        replacements.push({
          start: startIndex,
          end: endIndex,
          replacement: `\`\`\`${lang}\n\`\`\``,
        });
        continue;
      }

      // Calculate minimum indentation
      let minIndent = Infinity;
      for (const line of activeLines) {
        // Convert tabs to 2 spaces for consistent calculation
        const expandedLine = line.replace(/\t/g, "  ");
        const m = expandedLine.match(/^\s*/);
        const indent = m ? m[0].length : 0;
        if (indent < minIndent) minIndent = indent;
      }

      if (minIndent === Infinity) minIndent = 0;

      const dedented = activeLines
        .map((line) => {
          // Flatten tabs to 2 spaces
          const expandedLine = line.replace(/\t/g, "  ");
          // Remove common indent
          const trimmed =
            expandedLine.length >= minIndent
              ? expandedLine.slice(minIndent)
              : expandedLine;

          // Apply 2x indentation scaling for wider visuals (2 spaces -> 4 spaces)
          return trimmed.replace(/^ +/g, (match) => match.repeat(1));
        })
        .join("\n");

      replacements.push({
        start: startIndex,
        end: endIndex,
        replacement: `\`\`\`${lang}\n${dedented}\n\`\`\``,
      });
    }

    // Apply replacements from back to front
    let finalStr = processed;
    for (let i = replacements.length - 1; i >= 0; i--) {
      const { start, end, replacement } = replacements[i];
      finalStr = finalStr.slice(0, start) + replacement + finalStr.slice(end);
    }

    return finalStr;
  }, [markdown]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container relative z-0 flex h-full w-full flex-col">
        <div className="editor-inner relative h-full w-full grow">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="editor-input h-full w-full resize-none p-4 focus:outline-none" />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <CodeHighlightPlugin />
          <OpenLinksInNewTabPlugin />
          <MarkdownInitializerPlugin
            markdown={formattedMarkdown}
            transformers={CUSTOM_TRANSFORMERS}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}
