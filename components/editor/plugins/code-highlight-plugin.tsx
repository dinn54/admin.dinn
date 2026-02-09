"use client";

import { registerCodeHighlighting } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

// @ts-expect-error - prismjs default export typing is incomplete in this setup.
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-bash";

// Prism을 전역에 등록 (Lexical이 globalThis.Prism을 찾음)
if (typeof window !== "undefined") {
  (window as Window & { Prism?: typeof Prism }).Prism = Prism;
  // Align editor highlighting with preview behavior for JSX/TSX-heavy fenced blocks.
  if (Prism.languages.tsx) {
    Prism.languages.typescript = Prism.languages.tsx;
    Prism.languages.ts = Prism.languages.tsx;
  }
  if (Prism.languages.jsx) {
    Prism.languages.javascript = Prism.languages.jsx;
    Prism.languages.js = Prism.languages.jsx;
  }
  if (Prism.languages.markup) {
    Prism.languages.html = Prism.languages.markup;
    Prism.languages.xml = Prism.languages.markup;
  }
  if (Prism.languages.bash) {
    Prism.languages.shell = Prism.languages.bash;
    Prism.languages.sh = Prism.languages.bash;
  }
}

export default function CodeHighlightPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return registerCodeHighlighting(editor);
  }, [editor]);
  return null;
}
