import {
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  Transformer,
} from "@lexical/markdown";

import {
  $createServerImageNode,
  $isServerImageNode,
  ServerImageNode,
  $createServerYouTubeNode,
  $isServerYouTubeNode,
  ServerYouTubeNode,
  $createServerTweetNode,
  $isServerTweetNode,
  ServerTweetNode,
  $createServerHorizontalRuleNode,
  $isServerHorizontalRuleNode,
  ServerHorizontalRuleNode,
} from "./serverNodes";

export const SERVER_IMAGE: Transformer = {
  dependencies: [ServerImageNode],
  export: (node) => {
    if (!$isServerImageNode(node)) {
      return null;
    }
    const width = node.getWidth();
    const widthStr = typeof width === "number" ? ` =${width}x` : "";
    return `![${node.getAltText()}](${node.getSrc()}${widthStr})`;
  },
  importRegExp: /!\[([^[]*)\]\(([^)\s]+)(?:\s*=(\d+)x)?\)/,
  regExp: /!\[([^[]*)\]\(([^)\s]+)(?:\s*=(\d+)x)?\)$/,
  replace: (textNode, match) => {
    const [, altText, src, widthStr] = match;
    const width = widthStr ? parseInt(widthStr, 10) : 500;
    const imageNode = $createServerImageNode({
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

export const SERVER_YOUTUBE: Transformer = {
  dependencies: [ServerYouTubeNode],
  export: (node) => {
    if (!$isServerYouTubeNode(node)) {
      return null;
    }
    const width = node.getWidth();
    return `[youtube](${node.getId()} =${width}x)`;
  },
  importRegExp: /\[youtube\]\(([^\s)]+)(?:\s*=(\d+)x)?\)/,
  regExp: /\[youtube\]\(([^\s)]+)(?:\s*=(\d+)x)?\)$/,
  replace: (textNode, match) => {
    const [, videoID, widthStr] = match;
    const width = widthStr ? parseInt(widthStr, 10) : 560;
    const youtubeNode = $createServerYouTubeNode(videoID);
    youtubeNode.setWidth(width);
    textNode.replace(youtubeNode);
  },
  trigger: ")",
  type: "text-match",
};

export const SERVER_TWEET: Transformer = {
  dependencies: [ServerTweetNode],
  export: (node) => {
    if (!$isServerTweetNode(node)) {
      return null;
    }
    return `[tweet](${node.getId()})`;
  },
  importRegExp: /\[tweet\]\(([^)]+)\)/,
  regExp: /\[tweet\]\(([^)]+)\)$/,
  replace: (textNode, match) => {
    const [, tweetID] = match;
    const tweetNode = $createServerTweetNode(tweetID);
    textNode.replace(tweetNode);
  },
  trigger: ")",
  type: "text-match",
};

export const SERVER_HR: Transformer = {
  dependencies: [ServerHorizontalRuleNode],
  export: (node) => {
    return $isServerHorizontalRuleNode(node) ? "***" : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode) => {
    const line = $createServerHorizontalRuleNode();
    parentNode.replace(line);
  },
  type: "element",
};

export const SERVER_TRANSFORMERS: Array<Transformer> = [
  SERVER_IMAGE,
  SERVER_YOUTUBE,
  SERVER_TWEET,
  SERVER_HR,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];
