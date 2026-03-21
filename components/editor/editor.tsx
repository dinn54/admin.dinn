"use client";

import type { LexicalEditor } from "lexical";
import { Editor as SharedEditor } from "dinn-lexical/react";

import TableCellActionMenuPlugin from "./plugins/TableCellActionMenuPlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizerPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { InsertPlugin } from "./plugins/insert-plugin";

interface EditorProps {
  readOnly?: boolean;
  initialEditorState?: string | null;
  content?: string;
  markdown?: string;
  onInit?: (editor: LexicalEditor) => void;
  onChange?: (value: string) => void;
  outputFormat?: "markdown" | "json";
  className?: string;
}

export function Editor(props: EditorProps) {
  return (
    <SharedEditor
      {...props}
      namespace="AdminDinnEditor"
      toolbar={<ToolbarPlugin />}
      editablePlugins={
        <>
          <InsertPlugin />
          <TableCellActionMenuPlugin />
          <TableCellResizerPlugin />
        </>
      }
    />
  );
}
