import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { HorizontalRuleNode } from "./nodes/HorizontalRuleNode";
import { YouTubeNode } from "./nodes/YouTubeNode";
import { TweetNode } from "./nodes/TweetNode";
import { ImageNode } from "./nodes/ImageNode";
import { EquationNode } from "./nodes/EquationNode";
import { PollNode } from "./nodes/PollNode";
import { StickyNode } from "./nodes/StickyNode";
import {
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
} from "./nodes/CollapsibleNode";
import { LayoutContainerNode, LayoutItemNode } from "./nodes/LayoutNode";
// import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
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
  EquationNode,
  PollNode,
  StickyNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  LayoutContainerNode,
  LayoutItemNode,
  TableNode,
  TableCellNode,
  TableRowNode,
];
