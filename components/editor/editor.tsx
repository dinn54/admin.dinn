import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ImageNode } from "./nodes/ImageNode";
import { YouTubeNode } from "./nodes/YouTubeNode";
import { TweetNode } from "./nodes/TweetNode";
import { HorizontalRuleNode } from "./nodes/HorizontalRuleNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalEditor } from "lexical";
import React, { useEffect } from "react";
import CodeHighlightPlugin from "./plugins/code-highlight-plugin";
import { CUSTOM_TRANSFORMERS } from "./markdown-transformers";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { cn } from "@/lib/utils";
import MarkdownInitializerPlugin from "./plugins/MarkdownInitializerPlugin";
import { InsertPlugin } from "./plugins/insert-plugin";
import theme from "./theme";

function Placeholder() {
  return (
    <div className="absolute top-2 left-4 text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap select-none pointer-events-none">
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
  ],
};

interface EditorProps {
  readOnly?: boolean;
  initialEditorState?: string | null;
  markdown?: string;
  onInit?: (editor: LexicalEditor) => void;
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

import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown"; // Make sure to import or use CUSTOM_TRANSFORMERS correctly

// ... existing imports

interface EditorProps {
  readOnly?: boolean;
  initialEditorState?: string | null;
  markdown?: string;
  onInit?: (editor: LexicalEditor) => void;
  onChange?: (markdown: string) => void;
}

// ... EditorInitPlugin

export function Editor({
  readOnly = false,
  initialEditorState,
  markdown,
  onInit,
  onChange,
  className,
}: EditorProps & { className?: string }) {
  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: initialEditorState,
        editable: !readOnly,
      }}
    >
      <div
        className={cn(
          "relative flex flex-col w-full h-full",
          !readOnly && "rounded-lg border bg-background shadow-sm overflow-hidden",
          className
        )}
      >
        {!readOnly && <ToolbarPlugin />}
        <div className="relative flex-1 min-h-0">
          <div className="absolute inset-0 overflow-y-auto">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className={cn(
                    "outline-none min-h-full w-full text-left relative z-10",
                    !readOnly ? "px-4 py-2" : "py-2"
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
          <LinkPlugin />
          <CodeHighlightPlugin />
          <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} />
          {!readOnly && <InsertPlugin />}
          {onChange && (
            <OnChangePlugin
              onChange={(editorState) => {
                editorState.read(() => {
                  const markdown =
                    $convertToMarkdownString(CUSTOM_TRANSFORMERS);
                  onChange(markdown);
                });
              }}
            />
          )}
          <MarkdownInitializerPlugin
            markdown={markdown || ""}
            transformers={CUSTOM_TRANSFORMERS}
          />
          {onInit && <EditorInitPlugin onInit={onInit} />}
        </div>
      </div>
    </LexicalComposer>
  );
}
