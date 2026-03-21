import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $convertToMarkdownString } from "@lexical/markdown";
import { LexicalEditor } from "lexical";
import React, { memo, useEffect, useMemo } from "react";

import { ImageNode } from "./nodes/ImageNode";
import { YouTubeNode } from "./nodes/YouTubeNode";
import { TweetNode } from "./nodes/TweetNode";
import { HorizontalRuleNode } from "./nodes/HorizontalRuleNode";
import CodeHighlightPlugin from "./plugins/code-highlight-plugin";
import { CUSTOM_TRANSFORMERS } from "./markdown-transformers";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { cn } from "@/lib/utils";
import MarkdownInitializerPlugin from "./plugins/MarkdownInitializerPlugin";
import NormalizeMediaParagraphPlugin from "./plugins/NormalizeMediaParagraphPlugin";
import NormalizeTableColumnWidthsPlugin from "./plugins/NormalizeTableColumnWidthsPlugin";
import { InsertPlugin } from "./plugins/insert-plugin";
import TableCellActionMenuPlugin from "./plugins/TableCellActionMenuPlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizerPlugin";
import { isLexicalEditorStateString } from "@/lib/content-format";
import theme from "./theme";
import {
  readOnlyRenderContentClassName,
  readOnlyRenderFrameClassName,
  readOnlyRenderRootClassName,
  readOnlyRenderScrollAreaClassName,
} from "./readOnlyRenderShell";

function Placeholder() {
  return (
    <div className="absolute top-2 left-12 overflow-hidden text-ellipsis whitespace-nowrap text-gray-400 select-none pointer-events-none">
      Enter some rich text...
    </div>
  );
}

const editorConfig = {
  namespace: "MyEditor",
  theme,
  onError(error: Error) {
    throw error;
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
    ImageNode,
    YouTubeNode,
    TweetNode,
    HorizontalRuleNode,
    TableNode,
    TableCellNode,
    TableRowNode,
  ],
};

interface EditorProps {
  readOnly?: boolean;
  initialEditorState?: string | null;
  content?: string;
  markdown?: string;
  onInit?: (editor: LexicalEditor) => void;
  onChange?: (value: string) => void;
  outputFormat?: "markdown" | "json";
}

function EditorInitPlugin({
  onInit,
}: {
  onInit: (editor: LexicalEditor) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    onInit(editor);
  }, [editor, onInit]);
  return null;
}

function EditorComponent({
  readOnly = false,
  initialEditorState,
  content,
  markdown,
  onInit,
  onChange,
  outputFormat = "markdown",
  className,
}: EditorProps & { className?: string }) {
  const hasLexicalState = isLexicalEditorStateString(content);
  const resolvedInitialEditorState =
    initialEditorState ?? (hasLexicalState ? content : undefined);
  const legacyMarkdown = markdown ?? (!hasLexicalState ? content || "" : "");
  const initialConfig = useMemo(
    () => ({
      ...editorConfig,
      editorState: resolvedInitialEditorState,
      editable: !readOnly,
    }),
    [readOnly, resolvedInitialEditorState]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        className={cn(
          readOnlyRenderRootClassName,
          !readOnly && "h-full",
          !readOnly && "overflow-hidden rounded-lg border bg-background shadow-sm",
          className
        )}
      >
        {!readOnly && <ToolbarPlugin />}
        <div
          className={cn(
            readOnlyRenderFrameClassName,
            !readOnly && "min-h-0 flex-1"
          )}
        >
          <div
            data-editor-scroll-area
            className={cn(
              !readOnly && "absolute inset-0 overflow-x-auto overflow-y-auto",
              readOnly && readOnlyRenderScrollAreaClassName
            )}
          >
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={cn(
                    readOnly && readOnlyRenderContentClassName,
                    !readOnly && "relative z-10 w-full text-left outline-none",
                    !readOnly && "min-h-full",
                    !readOnly ? "pl-12 pr-4 py-2" : "py-2"
                  )}
                />
              }
              placeholder={!readOnly ? <Placeholder /> : null}
              ErrorBoundary={({ children }) => <div>{children}</div>}
            />
          </div>
          <HistoryPlugin />
          {!readOnly && <AutoFocusPlugin />}
          <ListPlugin />
          <TablePlugin />
          <LinkPlugin />
          <ClickableLinkPlugin newTab />
          <CodeHighlightPlugin />
          <NormalizeMediaParagraphPlugin />
          {readOnly && <NormalizeTableColumnWidthsPlugin />}
          <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} />
          {!readOnly && <InsertPlugin />}
          {!readOnly && <TableCellActionMenuPlugin />}
          {!readOnly && <TableCellResizerPlugin />}
          {onChange && (
            <OnChangePlugin
              onChange={(editorState) => {
                editorState.read(() => {
                  if (outputFormat === "json") {
                    onChange(JSON.stringify(editorState.toJSON()));
                    return;
                  }
                  onChange($convertToMarkdownString(CUSTOM_TRANSFORMERS));
                });
              }}
            />
          )}
          {!resolvedInitialEditorState && (
            <MarkdownInitializerPlugin
              markdown={legacyMarkdown || ""}
              transformers={CUSTOM_TRANSFORMERS}
            />
          )}
          {onInit && <EditorInitPlugin onInit={onInit} />}
        </div>
      </div>
    </LexicalComposer>
  );
}

export const Editor = memo(EditorComponent);
