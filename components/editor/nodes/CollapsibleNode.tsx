
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

export const INSERT_COLLAPSIBLE_COMMAND: LexicalCommand<void> = createCommand(
  'INSERT_COLLAPSIBLE_COMMAND',
);

export class CollapsibleContainerNode extends ElementNode {
  static getType(): string {
    return 'collapsible-container';
  }

  static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
    return new CollapsibleContainerNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const details = document.createElement('details');
    details.open = true; // Default open
    details.className = 'collapsible-container border rounded-md p-2 my-2';
    return details;
  }

  updateDOM(prevNode: CollapsibleContainerNode, dom: HTMLElement): boolean {
    return false;
  }
  
  static importJSON(serializedNode: SerializedElementNode): CollapsibleContainerNode {
    return $createCollapsibleContainerNode();
  }

  exportJSON(): SerializedElementNode {
      return {
          ...super.exportJSON(),
          type: 'collapsible-container',
          version: 1
      }
  }
}

export function $createCollapsibleContainerNode(): CollapsibleContainerNode {
  return $applyNodeReplacement(new CollapsibleContainerNode());
}

export function $isCollapsibleContainerNode(node: LexicalNode | null | undefined): node is CollapsibleContainerNode {
  return node instanceof CollapsibleContainerNode;
}

// Title Node (Summary)
export class CollapsibleTitleNode extends ElementNode {
    static getType(): string {
        return 'collapsible-title';
    }
    
    static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
        return new CollapsibleTitleNode(node.__key);
    }
    
    createDOM(): HTMLElement {
        const summary = document.createElement('summary');
        summary.className = 'cursor-pointer font-semibold p-2 hover:bg-muted/50 rounded';
        return summary;
    }
    
    updateDOM(): boolean { return false; }

    static importJSON(serializedNode: SerializedElementNode): CollapsibleTitleNode {
        return $createCollapsibleTitleNode();
    }
    
    exportJSON(): SerializedElementNode {
        return { ...super.exportJSON(), type: 'collapsible-title', version: 1 };
    }
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
    return $applyNodeReplacement(new CollapsibleTitleNode());
}

export function $isCollapsibleTitleNode(node: LexicalNode | null | undefined): node is CollapsibleTitleNode {
    return node instanceof CollapsibleTitleNode;
}

// Content Node
export class CollapsibleContentNode extends ElementNode {
    static getType(): string {
        return 'collapsible-content';
    }
    
    static clone(node: CollapsibleContentNode): CollapsibleContentNode {
        return new CollapsibleContentNode(node.__key);
    }
    
    createDOM(): HTMLElement {
        const div = document.createElement('div');
        div.className = 'collapsible-content p-2';
        return div;
    }
    
    updateDOM(): boolean { return false; }
    
    static importJSON(serializedNode: SerializedElementNode): CollapsibleContentNode {
        return $createCollapsibleContentNode();
    }
    
    exportJSON(): SerializedElementNode {
        return { ...super.exportJSON(), type: 'collapsible-content', version: 1 };
    }
}

export function $createCollapsibleContentNode(): CollapsibleContentNode {
    return $applyNodeReplacement(new CollapsibleContentNode());
}

export function $isCollapsibleContentNode(node: LexicalNode | null | undefined): node is CollapsibleContentNode {
    return node instanceof CollapsibleContentNode;
}
