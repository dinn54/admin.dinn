import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  Transformer,
} from "@lexical/markdown";

import { $createTweetNode, $isTweetNode, TweetNode } from "./nodes/TweetNode";
import { $createImageNode, $isImageNode, ImageNode } from "./nodes/ImageNode";
import {
  $createYouTubeNode,
  $isYouTubeNode,
  YouTubeNode,
} from "./nodes/YouTubeNode";

export const IMAGE: Transformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }
    const width = node.__width;
    const widthStr = typeof width === "number" ? ` =${width}x` : "";
    return `![${node.getAltText()}](${node.getSrc()}${widthStr})`;
  },
  // Match: ![alt](src) or ![alt](src =500x)
  importRegExp: /!\[([^[]*)\]\(([^)\s]+)(?:\s*=(\d+)x)?\)/,
  regExp: /!\[([^[]*)\]\(([^)\s]+)(?:\s*=(\d+)x)?\)$/,
  replace: (textNode, match) => {
    const [, altText, src, widthStr] = match;
    const width = widthStr ? parseInt(widthStr, 10) : 500;
    const imageNode = $createImageNode({
      altText,
      src,
      width,
      maxWidth: 800,
    });
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match",
};

export const YOUTUBE: Transformer = {
  dependencies: [YouTubeNode],
  export: (node) => {
    if (!$isYouTubeNode(node)) {
      return null;
    }
    const width = node.getWidth();
    return `[youtube](${node.getId()} =${width}x)`;
  },
  // Match: [youtube](videoID) or [youtube](videoID =560x)
  importRegExp: /\[youtube\]\(([^\s)]+)(?:\s*=(\d+)x)?\)/,
  regExp: /\[youtube\]\(([^\s)]+)(?:\s*=(\d+)x)?\)$/,
  replace: (textNode, match) => {
    const [, videoID, widthStr] = match;
    const width = widthStr ? parseInt(widthStr, 10) : 560;
    const youtubeNode = $createYouTubeNode(videoID);
    youtubeNode.setWidth(width);
    textNode.replace(youtubeNode);
  },
  trigger: ")",
  type: "text-match",
};

export const TWEET: Transformer = {
  dependencies: [TweetNode],
  export: (node) => {
    if (!$isTweetNode(node)) {
      return null;
    }
    return `[tweet](${node.getId()})`;
  },
  importRegExp: /\[tweet\]\(([^)]+)\)/,
  regExp: /\[tweet\]\(([^)]+)\)$/,
  replace: (textNode, match) => {
    const [, tweetID] = match;
    const tweetNode = $createTweetNode(tweetID);
    textNode.replace(tweetNode);
  },
  trigger: ")",
  type: "text-match",
};

import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "./nodes/HorizontalRuleNode";

export const HR: Transformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => {
    return $isHorizontalRuleNode(node) ? "***" : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2) => {
    const line = $createHorizontalRuleNode();
    parentNode.replace(line);
  },
  type: "element",
};

export const CUSTOM_TRANSFORMERS: Array<Transformer> = [
  IMAGE,
  YOUTUBE,
  TWEET,
  HR,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];
