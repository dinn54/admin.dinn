
import {
  LexicalCommand,
  createCommand,
  COMMAND_PRIORITY_EDITOR,
  $createParagraphNode,
} from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_TWEET_COMMAND, $createTweetNode } from '../nodes/TweetNode';
import { INSERT_IMAGE_COMMAND, $createImageNode, ImagePayload } from '../nodes/ImageNode';
import { $createYouTubeNode } from '../nodes/YouTubeNode';

// YouTube insert command
export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_YOUTUBE_COMMAND'
);

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

    // Image insert command
    useEffect(() => {
        return editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload: ImagePayload) => {
                editor.update(() => {
                    const node = $createImageNode(payload);
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
