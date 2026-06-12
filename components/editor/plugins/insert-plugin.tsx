
import {
  COMMAND_PRIORITY_EDITOR,
} from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createTweetNode,
  $createYouTubeNode,
  INSERT_TWEET_COMMAND,
  INSERT_YOUTUBE_COMMAND,
} from "dinn-lexical/react";

export function InsertPlugin() {
    const [editor] = useLexicalComposerContext();

    // Tweet insert command
    useEffect(() => {
        return editor.registerCommand(
            INSERT_TWEET_COMMAND,
            (id: string) => {
                editor.update(() => {
                    const node = $createTweetNode(id);
                    $insertNodeToNearestRoot(node);
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    // YouTube insert command
    useEffect(() => {
        return editor.registerCommand(
            INSERT_YOUTUBE_COMMAND,
            (videoId: string) => {
                editor.update(() => {
                    const node = $createYouTubeNode(videoId);
                    $insertNodeToNearestRoot(node);
                });
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        );
    }, [editor]);

    return null;
}
