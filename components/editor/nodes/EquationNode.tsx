
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

import {createCommand, DecoratorNode, $applyNodeReplacement} from 'lexical';
import * as React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface EquationPayload {
  equation: string;
  inline: boolean;
}

export const INSERT_EQUATION_COMMAND: LexicalCommand<EquationPayload> = createCommand(
  'INSERT_EQUATION_COMMAND',
);

export type SerializedEquationNode = Spread<
  {
    equation: string;
    inline: boolean;
  },
  SerializedLexicalNode
>;

export class EquationNode extends DecoratorNode<React.ReactElement> {
  __equation: string;
  __inline: boolean;

  static getType(): string {
    return 'equation';
  }

  static clone(node: EquationNode): EquationNode {
    return new EquationNode(node.__equation, node.__inline, node.__key);
  }

  static importJSON(serializedNode: SerializedEquationNode): EquationNode {
    const node = $createEquationNode(
      serializedNode.equation,
      serializedNode.inline,
    );
    return node;
  }

  exportJSON(): SerializedEquationNode {
    return {
      equation: this.getEquation(),
      inline: this.__inline,
      type: 'equation',
      version: 1,
    };
  }

  constructor(equation: string, inline?: boolean, key?: NodeKey) {
    super(key);
    this.__equation = equation;
    this.__inline = inline ?? false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement(this.__inline ? 'span' : 'div');
    // Encoder logic would go here
    element.innerHTML = this.__equation; 
    return {element};
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-equation')) {
          return null;
        }
        return {
          conversion: convertEquationElement,
          priority: 2,
        };
      },
      span: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-equation')) {
          return null;
        }
        return {
          conversion: convertEquationElement,
          priority: 1,
        };
      },
    };
  }

  getEquation(): string {
    return this.__equation;
  }

  setEquation(equation: string): void {
    const writable = this.getWritable();
    writable.__equation = equation;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement(this.__inline ? 'span' : 'div');
    if (this.__inline) {
       element.className = 'editor-equation-inline';
    } else {
       element.className = 'editor-equation-block';
    }
    return element;
  }

  updateDOM(prevNode: EquationNode): boolean {
    return (
        this.__inline !== prevNode.__inline
    );
  }

  getTextContent(): string {
    return this.__equation;
  }

  decorate(): React.ReactElement {
    return (
        <EquationComponent 
            equation={this.__equation} 
            inline={this.__inline}
        />
    );
  }
}

function EquationComponent({ equation, inline }: { equation: string; inline: boolean }) {
    const ref = React.useRef<HTMLElement>(null);
    
    React.useEffect(() => {
        if (ref.current) {
            try {
                katex.render(equation, ref.current, {
                    displayMode: !inline,
                    throwOnError: false,
                });
            } catch (e) {
                // Ignore
            }
        }
    }, [equation, inline]);

    return inline ? <span ref={ref} /> : <div ref={ref as any} />;
}


function convertEquationElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  const equation = domNode.getAttribute('data-lexical-equation');
  if (equation) {
    const inline = domNode.tagName === 'SPAN';
    const node = $createEquationNode(equation, inline);
    return {node};
  }
  return null;
}

export function $createEquationNode(
  equation = '',
  inline = false,
): EquationNode {
  const node = new EquationNode(equation, inline);
  return $applyNodeReplacement(node);
}

export function $isEquationNode(
  node: LexicalNode | null | undefined,
): node is EquationNode {
  return node instanceof EquationNode;
}
