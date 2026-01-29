import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';

import {createCommand, DecoratorNode, $applyNodeReplacement} from 'lexical';
import * as React from 'react';

export type SerializedHorizontalRuleNode = SerializedLexicalNode;

export const INSERT_HORIZONTAL_RULE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_HORIZONTAL_RULE_COMMAND',
);

export class HorizontalRuleNode extends DecoratorNode<React.ReactElement> {
  static getType(): string {
    return 'horizontalrule';
  }

  static clone(node: HorizontalRuleNode): HorizontalRuleNode {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON(
    serializedNode: SerializedHorizontalRuleNode,
  ): HorizontalRuleNode {
    return $createHorizontalRuleNode();
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: (domNode: HTMLElement) => {
        return {
          conversion: convertHorizontalRuleElement,
          priority: 0,
        };
      },
    };
  }

  exportJSON(): SerializedHorizontalRuleNode {
    return {
      type: 'horizontalrule',
      version: 1,
    };
  }

  exportDOM(): DOMExportOutput {
    return {element: document.createElement('hr')};
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('div');
    element.style.display = 'contents';
    return element;
  }

  getTextContent(): string {
    return '\n';
  }

  isInline(): boolean {
    return false;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): React.ReactElement {
    return <hr className="my-8 border-t-2 border-muted" />;
  }
}

function convertHorizontalRuleElement(
  domNode: HTMLElement,
): DOMConversionOutput {
  return {node: $createHorizontalRuleNode()};
}

export function $createHorizontalRuleNode(): HorizontalRuleNode {
  return $applyNodeReplacement(new HorizontalRuleNode());
}

export function $isHorizontalRuleNode(
  node: LexicalNode | null | undefined,
): node is HorizontalRuleNode {
  return node instanceof HorizontalRuleNode;
}
