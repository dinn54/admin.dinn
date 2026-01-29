
import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementNode,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  createCommand,
  $applyNodeReplacement,
} from 'lexical';
import * as React from 'react';
import { cn } from '@/lib/utils';
// import { EditorNested } from '@/components/editor/editor-nested';

export const INSERT_STICKY_NODE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_STICKY_NODE_COMMAND',
);

export type SerializedStickyNode = SerializedElementNode & {
    color: 'yellow' | 'pink' | 'blue' | 'green';
};

export class StickyNode extends ElementNode {
  __color: 'yellow' | 'pink' | 'blue' | 'green';

  static getType(): string {
    return 'sticky';
  }

  static clone(node: StickyNode): StickyNode {
    return new StickyNode(node.__color, node.__key);
  }

  static importJSON(serializedNode: SerializedStickyNode): StickyNode {
    const node = $createStickyNode(serializedNode.color);
    return node;
  }

  exportJSON(): SerializedStickyNode {
    return {
      ...super.exportJSON(),
      color: this.__color,
      type: 'sticky',
      version: 1,
    };
  }

  constructor(color: 'yellow' | 'pink' | 'blue' | 'green' = 'yellow', key?: NodeKey) {
    super(key);
    this.__color = color;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = `sticky-note ${this.__color}`;
    div.style.position = 'relative';
    div.style.padding = '1rem';
    div.style.margin = '1rem 0';
    div.style.borderRadius = '0.5rem';
    div.style.width = '200px';
    div.style.minHeight = '200px';
    // Define colors directly here for simplicity if CSS classes aren't set up
    const colors = {
        yellow: '#fcf0ad',
        pink: '#fcd0d0',
        blue: '#d0effc',
        green: '#d0fcd0',
    };
    div.style.backgroundColor = colors[this.__color];

    return div;
  }

  updateDOM(prevNode: StickyNode, dom: HTMLElement): boolean {
    if (prevNode.__color !== this.__color) {
        dom.className = `sticky-note ${this.__color}`;
         const colors = {
            yellow: '#fcf0ad',
            pink: '#fcd0d0',
            blue: '#d0effc',
            green: '#d0fcd0',
        };
        dom.style.backgroundColor = colors[this.__color];
        return true;
    }
    return false;
  }

  static importDOM(): DOMConversionMap | null {
      return null; // Simplified
  }
}

export function $createStickyNode(color: 'yellow' | 'pink' | 'blue' | 'green' = 'yellow'): StickyNode {
  return $applyNodeReplacement(new StickyNode(color));
}

export function $isStickyNode(
  node: LexicalNode | null | undefined,
): node is StickyNode {
  return node instanceof StickyNode;
}
