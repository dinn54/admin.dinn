import { createHeadlessEditor } from "@lexical/headless";
import {
  $convertFromMarkdownString,
  TRANSFORMERS as BASE_TRANSFORMERS,
  TextMatchTransformer,
} from "@lexical/markdown";
import { EditorNodes } from "@/components/editor/nodes";
import {
  $createYouTubeNode,
  YouTubeNode,
} from "@/components/editor/nodes/YouTubeNode";
import { LexicalNode, TextNode } from "lexical";

// Custom Transformer for [youtube](id)
const YOUTUBE_TRANSFORMER: TextMatchTransformer = {
  dependencies: [YouTubeNode],
  export: (node) => null, // Not needed for import-only
  regExp: /\[youtube\]\((.*?)\)/,
  replace: (textNode: TextNode, match: RegExpMatchArray) => {
    const [, videoID] = match;
    const node = $createYouTubeNode(videoID);
    textNode.replace(node);
  },
  trigger: "[",
  type: "text-match",
};

const TRANSFORMERS = [...BASE_TRANSFORMERS, YOUTUBE_TRANSFORMER];

export function markdownToLexical(markdown: string): LexicalNode[] {
  const editor = createHeadlessEditor({
    nodes: EditorNodes,
    onError: (error) => {
      console.error(error);
    },
  });

  // Since we are running in a headless environment, we need to mock some DOM envs if needed
  // But @lexical/headless handles most of it.

  // Update state to convert markdown
  editor.update(() => {
    $convertFromMarkdownString(markdown, TRANSFORMERS);
  });

  const editorState = editor.getEditorState();
  const json = editorState.toJSON();

  // Return root children as expected by the renderer
  return json.root.children as unknown as LexicalNode[];
}
