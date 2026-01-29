
import {
  ElementNode,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  $applyNodeReplacement,
  Spread,
  EditorConfig,
  LexicalCommand,
  createCommand
} from 'lexical';

export type SerializedLayoutContainerNode = SerializedElementNode & {
    templateColumns: string;
};

export class LayoutContainerNode extends ElementNode {
    __templateColumns: string;

    static getType(): string { return 'layout-container'; }
    static clone(node: LayoutContainerNode): LayoutContainerNode {
        return new LayoutContainerNode(node.__templateColumns, node.__key);
    }
    
    constructor(templateColumns: string, key?: NodeKey) {
        super(key);
        this.__templateColumns = templateColumns;
    }
    
    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.style.display = 'grid';
        div.style.gridTemplateColumns = this.__templateColumns;
        div.style.gap = '1rem';
        div.className = 'my-4 layout-container';
        return div;
    }
    
    updateDOM(prevNode: LayoutContainerNode, dom: HTMLElement): boolean {
        if (prevNode.__templateColumns !== this.__templateColumns) {
            dom.style.gridTemplateColumns = this.__templateColumns;
            return true;
        }
        return false;
    }
    
    static importJSON(json: SerializedLayoutContainerNode): LayoutContainerNode {
        return $createLayoutContainerNode(json.templateColumns);
    }
    
    exportJSON(): SerializedLayoutContainerNode {
        return {
            ...super.exportJSON(),
            templateColumns: this.__templateColumns,
            type: 'layout-container',
            version: 1
        };
    }
}

export function $createLayoutContainerNode(templateColumns: string): LayoutContainerNode {
    return $applyNodeReplacement(new LayoutContainerNode(templateColumns));
}

export function $isLayoutContainerNode(node: LexicalNode | null | undefined): node is LayoutContainerNode {
    return node instanceof LayoutContainerNode;
}


export class LayoutItemNode extends ElementNode {
    static getType(): string { return 'layout-item'; }
    static clone(node: LayoutItemNode): LayoutItemNode {
        return new LayoutItemNode(node.__key);
    }
    
    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        div.className = 'layout-item border p-2 rounded';
        return div;
    }
    
    updateDOM(): boolean { return false; }
    
    static importJSON(json: SerializedElementNode): LayoutItemNode {
        return $createLayoutItemNode();
    }
    
    exportJSON(): SerializedElementNode {
        return { ...super.exportJSON(), type: 'layout-item', version: 1 };
    }
}

export function $createLayoutItemNode(): LayoutItemNode {
    return $applyNodeReplacement(new LayoutItemNode());
}

export function $isLayoutItemNode(node: LexicalNode | null | undefined): node is LayoutItemNode {
    return node instanceof LayoutItemNode;
}

export const INSERT_LAYOUT_COMMAND: LexicalCommand<string> = createCommand('INSERT_LAYOUT_COMMAND');
