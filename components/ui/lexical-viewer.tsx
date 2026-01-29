"use client";

import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
// import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

function MarkdownLoader({ markdown }: { markdown: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      $convertFromMarkdownString(markdown, TRANSFORMERS);
    });
  }, [markdown, editor]);

  return null;
}

const theme = {
  ltr: "ltr",
  rtl: "rtl",
  placeholder: "editor-placeholder",
  paragraph: "editor-paragraph",
  quote: "editor-quote border-l-4 border-muted pl-4 italic text-muted-foreground my-2",
  heading: {
    h1: "editor-heading-h1 text-3xl font-bold mt-4 mb-2 scroll-m-20 tracking-tight",
    h2: "editor-heading-h2 text-2xl font-semibold mt-4 mb-2 scroll-m-20 tracking-tight",
    h3: "editor-heading-h3 text-xl font-semibold mt-4 mb-2 scroll-m-20 tracking-tight",
  },
  list: {
    ul: "editor-list-ul list-disc list-inside space-y-1 my-2",
    ol: "editor-list-ol list-decimal list-inside space-y-1 my-2",
  },
  listitem: "editor-listitem",
  link: "editor-link text-primary underline underline-offset-4 hover:no-underline",
  text: {
    bold: "editor-text-bold font-bold",
    italic: "editor-text-italic italic",
    underline: "editor-text-underline underline",
    strikethrough: "editor-text-strikethrough line-through",
  },
  code: "editor-code relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
};

interface LexicalMarkdownViewerProps {
  content: string;
}

export function LexicalMarkdownViewer({ content }: LexicalMarkdownViewerProps) {
  const initialConfig = {
    namespace: "MarkdownViewer",
    theme,
    onError: (error: Error) => console.error(error),
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      CodeHighlightNode,
      CodeHighlightNode,
      // TableNode,
      // TableCellNode,
      // TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    editable: false,
  };

  return (
    <div className="relative rounded-md border p-4 bg-card text-card-foreground shadow-sm min-h-[150px] overflow-auto">
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable className="outline-none min-h-full" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <MarkdownLoader markdown={content} />
        <ListPlugin />
        <LinkPlugin />
      </LexicalComposer>
    </div>
  );
}
