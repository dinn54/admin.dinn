"use client";

import { Editor } from "@/components/editor/editor";

export function ReadOnlyLexicalRenderer({ content }: { content: string }) {
  return <Editor readOnly={true} content={content} />;
}
