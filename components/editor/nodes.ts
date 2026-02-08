import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "./nodes/HorizontalRuleNode";
import { YouTubeNode } from "./nodes/YouTubeNode";
import { TweetNode } from "./nodes/TweetNode";
import { ImageNode } from "./nodes/ImageNode";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";

export const EditorNodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  HorizontalRuleNode,
  YouTubeNode,
  TweetNode,
  ImageNode,
  TableNode,
  TableCellNode,
  TableRowNode,
];
