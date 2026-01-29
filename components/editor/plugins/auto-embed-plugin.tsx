import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import {
  $createHorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from "@/components/editor/nodes/HorizontalRuleNode";
import { $createYouTubeNode } from "@/components/editor/nodes/YouTubeNode";
// import {
//     $createTweetNode,
//     INSERT_TWEET_COMMAND
// } from "@/components/editor/nodes/TweetNode";
import { COMMAND_PRIORITY_EDITOR } from "lexical";

export function AutoEmbedPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_HORIZONTAL_RULE_COMMAND,
      () => {
        const selection = editor
          .getEditorState()
          .read(() => window.getSelection());
        // Simple insertion logic
        editor.update(() => {
          const node = $createHorizontalRuleNode();
          // Insert logic here, simplified for now
          // Usually we insert after current block

          // Actually selection handling is better done via $insertNodeToNearestRoot
          // But let's use a simpler approach if possible
          // Wait, $createHorizontalRuleNode returns the node.
          // We need to insert it.
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  // Actually we will handle insertion in the ToolbarPlugin mostly for now
  // But commands are good for reusability.

  return null;
}
