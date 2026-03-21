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

import {
  createCommand,
  DecoratorNode,
  $applyNodeReplacement,
} from 'lexical';
import * as React from 'react';
import {useLexicalNodeSelection} from '@lexical/react/useLexicalNodeSelection';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import theme from "../theme";
import { cn } from "@/lib/utils";

function HorizontalRuleComponent({nodeKey}: {nodeKey: NodeKey}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  return (
    <div
      className={cn(theme.hrBlock, isSelected && theme.hrSelected)}
    >
      <div
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (event.shiftKey) {
            setSelected(!isSelected);
          } else {
            clearSelection();
            setSelected(true);
          }
        }}
        className={theme.hrInner}
      >
        <hr className={theme.hr} />
      </div>
    </div>
  );
}

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
    element.className = theme.decoratorContents;
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
    return <HorizontalRuleComponent nodeKey={this.getKey()} />;
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
