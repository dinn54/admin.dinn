import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  createCommand,
  DecoratorNode,
  $applyNodeReplacement,
  $getNodeByKey,
} from "lexical";
import * as React from "react";
import PollComponent from "./PollComponent";

export interface PollOption {
  uid: string;
  text: string;
  votes: number;
}

export interface PollPayload {
  question: string;
  options: PollOption[];
}

export const INSERT_POLL_COMMAND: LexicalCommand<PollPayload> = createCommand(
  "INSERT_POLL_COMMAND"
);

export type SerializedPollNode = Spread<
  {
    question: string;
    options: PollOption[];
  },
  SerializedLexicalNode
>;

export class PollNode extends DecoratorNode<React.ReactElement> {
  __question: string;
  __options: PollOption[];

  static getType(): string {
    return "poll";
  }

  static clone(node: PollNode): PollNode {
    return new PollNode(node.__question, node.__options, node.__key);
  }

  static importJSON(serializedNode: SerializedPollNode): PollNode {
    const node = $createPollNode(
      serializedNode.question,
      serializedNode.options
    );
    return node;
  }

  constructor(question: string, options: PollOption[], key?: NodeKey) {
    super(key);
    this.__question = question;
    this.__options = options;
  }

  exportJSON(): SerializedPollNode {
    return {
      options: this.__options,
      question: this.__question,
      type: "poll",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    div.className = "poll-node";
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactElement {
    return (
      <PollComponent question={this.__question} options={this.__options} />
    );
  }
}

export function $createPollNode(
  question: string,
  options: PollOption[]
): PollNode {
  return $applyNodeReplacement(new PollNode(question, options));
}

export function $isPollNode(
  node: LexicalNode | null | undefined
): node is PollNode {
  return node instanceof PollNode;
}
