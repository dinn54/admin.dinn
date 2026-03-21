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
    quote: "editor-quote",
    heading: {
      h1: "editor-heading-h1",
      h2: "editor-heading-h2",
      h3: "editor-heading-h3",
    },
    list: {
      ul: "editor-list-ul",
      ol: "editor-list-ol",
    },
    listitem: "editor-listitem",
    link: "editor-link",
    text: {
      bold: "editor-text-bold",
      italic: "editor-text-italic",
      underline: "editor-text-underline",
      strikethrough: "editor-text-strikethrough",
    },
    code: "editor-text-code",
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
