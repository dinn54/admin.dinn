import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { $convertFromMarkdownString, Transformer } from "@lexical/markdown";
import { $getRoot } from "lexical";

export default function MarkdownInitializerPlugin({
  markdown,
  transformers,
}: {
  markdown: string;
  transformers: Array<Transformer>;
}) {
  const [editor] = useLexicalComposerContext();
  const initializedRef = useRef(false);
  const initialMarkdownRef = useRef<string | null>(null);

  useEffect(() => {
    // Only initialize once with non-empty markdown, or once with empty if that's the initial state
    if (initializedRef.current) {
      // If already initialized with empty, allow one more initialization when real data comes
      if (initialMarkdownRef.current === "" && markdown && markdown !== "") {
        // Real data arrived after initial empty state
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          $convertFromMarkdownString(markdown, transformers);
        });
        initialMarkdownRef.current = markdown;
      }
      return;
    }

    // First initialization
    editor.update(() => {
      if (markdown) {
        $convertFromMarkdownString(markdown, transformers);
      }
    });

    initializedRef.current = true;
    initialMarkdownRef.current = markdown;
  }, [editor, markdown, transformers]);

  return null;
}
