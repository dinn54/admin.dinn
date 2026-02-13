"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $isElementNode,
  $getSelection,
  $getRoot,
  $getNodeByKey,
  type LexicalNode,
  $isNodeSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $isTableNode,
  $isTableSelection,
} from "@lexical/table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SET_SELECTED_TABLE_KEY_COMMAND } from "./table-block-selection";

type ActiveBlockState = {
  key: string;
  rect: DOMRect;
  isTable: boolean;
};

type DropIndicatorState = {
  targetKey: string;
  insertAfter: boolean;
  top: number;
};

const HANDLE_GUTTER_WIDTH = 48;
const EDITOR_RIGHT_PADDING = 16;
const HANDLE_TOP_PADDING = 8;

function resolveVisualElement(element: HTMLElement): HTMLElement {
  const image = element.querySelector<HTMLElement>("img");
  if (image) {
    const imageWrapper = image.closest("div");
    if (imageWrapper && element.contains(imageWrapper)) {
      return imageWrapper;
    }
    return image;
  }

  const media = element.querySelector<HTMLElement>("iframe, table, pre, blockquote, hr");
  if (media) return media;

  return element;
}

function resolveVisualRect(element: HTMLElement): DOMRect {
  const visualElement = resolveVisualElement(element);
  const visualRect = visualElement.getBoundingClientRect();
  if (visualRect.width > 0 || visualRect.height > 0) return visualRect;
  return element.getBoundingClientRect();
}

function getBlockNodeFromSelection() {
  const selection = $getSelection();
  if (!selection) return null;

  if ($isNodeSelection(selection)) {
    const selectedNodes = selection.getNodes();
    if (selectedNodes.length === 0) return null;
    const node = selectedNodes[0];
    if (node.getKey() === "root") return null;
    const parent = node.getParent();
    if (parent && parent.getKey() === "root") {
      return node;
    }
    return node.getTopLevelElementOrThrow();
  }

  if ($isRangeSelection(selection)) {
    const anchorCell =
      $getTableCellNodeFromLexicalNode(selection.anchor.getNode()) ||
      $getTableCellNodeFromLexicalNode(selection.focus.getNode());
    if (anchorCell) {
      return $getTableNodeFromLexicalNodeOrThrow(anchorCell);
    }

    const anchorNode = selection.anchor.getNode();
    if (anchorNode.getKey() === "root") {
      if ($isElementNode(anchorNode)) {
        const firstChild = anchorNode.getFirstChild();
        return firstChild ?? null;
      }
      return null;
    }
    return anchorNode.getTopLevelElementOrThrow();
  }

  if ($isTableSelection(selection)) {
    const anchorCell = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
    if (!anchorCell) return null;
    return $getTableNodeFromLexicalNodeOrThrow(anchorCell);
  }

  return null;
}

export default function TableBlockSelectorPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeBlock, setActiveBlock] = useState<ActiveBlockState | null>(null);
  const [selectedBlockKey, setSelectedBlockKey] = useState<string | null>(null);
  const [draggingBlockKey, setDraggingBlockKey] = useState<string | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorState | null>(null);
  const [overlayRect, setOverlayRect] = useState<DOMRect | null>(null);
  const draggingBlockKeyRef = useRef<string | null>(null);
  const dropIndicatorRef = useRef<DropIndicatorState | null>(null);
  const suppressClickRef = useRef(false);

  const clearSelectedTable = useCallback(() => {
    setSelectedBlockKey(null);
    try {
      editor.dispatchCommand(SET_SELECTED_TABLE_KEY_COMMAND, null);
    } catch {
      // ignore transient invalid-selection phase
    }
  }, [editor]);

  const focusMovedNode = useCallback((node: LexicalNode) => {
    if ($isElementNode(node)) {
      node.selectStart();
      return;
    }
    node.selectNext();
  }, []);

  const refreshActiveBlock = useCallback(() => {
    try {
      editor.getEditorState().read(() => {
        const blockNode = getBlockNodeFromSelection();
        if (!blockNode) {
          setActiveBlock(null);
          return;
        }
      const blockElement = editor.getElementByKey(blockNode.getKey());
      if (!blockElement) {
        setActiveBlock(null);
        return;
      }
      const isTableBlock = $isTableNode(blockNode);
      const visualRect = resolveVisualRect(blockElement);
      setActiveBlock({
        key: blockNode.getKey(),
        rect: visualRect,
        isTable: isTableBlock,
      });
      });
    } catch {
      // selection can be stale for one tick while moving nodes
      setActiveBlock(null);
    }
  }, [editor]);

  useEffect(() => {
    dropIndicatorRef.current = dropIndicator;
  }, [dropIndicator]);

  useEffect(() => {
    const resolveOverlayRect = () => {
      const root = editor.getRootElement();
      if (!root) {
        setOverlayRect(null);
        return;
      }
      const overlayParent =
        (root.closest("[data-editor-scroll-area]") as HTMLElement | null) ||
        (root.closest(".absolute.inset-0.overflow-y-auto") as HTMLElement | null) ||
        root.parentElement;
      setOverlayRect(overlayParent?.getBoundingClientRect() ?? null);
    };
    resolveOverlayRect();
    window.addEventListener("resize", resolveOverlayRect);
    return () => window.removeEventListener("resize", resolveOverlayRect);
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          refreshActiveBlock();
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerUpdateListener(() => {
        refreshActiveBlock();
      })
    );
  }, [editor, refreshActiveBlock]);

  useEffect(() => {
    const onWindowChange = () => refreshActiveBlock();
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange, true);
    return () => {
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange, true);
    };
  }, [refreshActiveBlock]);

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;
    if (!overlayRect) return;

    const onMouseMove = (event: MouseEvent) => {
      const draggingKey = draggingBlockKeyRef.current;
      if (!draggingKey) return;
      suppressClickRef.current = true;

      editor.getEditorState().read(() => {
        const draggedNode = $getNodeByKey(draggingKey);
        if (!draggedNode) {
          setDropIndicator(null);
          return;
        }
        const blocks = $getRoot()
          .getChildren()
          .map((node) => {
            const el = editor.getElementByKey(node.getKey());
            if (!el) return null;
            return {
              key: node.getKey(),
              rect: el.getBoundingClientRect(),
            };
          })
          .filter((item): item is { key: string; rect: DOMRect } => item !== null)
          .filter((item) => item.key !== draggingKey)
          .sort((a, b) => a.rect.top - b.rect.top);

        if (blocks.length === 0) {
          setDropIndicator(null);
          return;
        }

        const mouseY = Math.min(
          overlayRect.bottom - 1,
          Math.max(overlayRect.top + 1, event.clientY)
        );

        let nextIndicator: DropIndicatorState | null = null;
        for (const block of blocks) {
          const midY = block.rect.top + block.rect.height / 2;
          if (mouseY < midY) {
            nextIndicator = {
              targetKey: block.key,
              insertAfter: false,
              top: block.rect.top,
            };
            break;
          }
        }

        if (!nextIndicator) {
          const lastBlock = blocks[blocks.length - 1];
          nextIndicator = {
            targetKey: lastBlock.key,
            insertAfter: true,
            top: lastBlock.rect.bottom,
          };
        }

        setDropIndicator(nextIndicator);
      });
    };

    const onMouseUp = () => {
      const draggingKey = draggingBlockKeyRef.current;
      if (!draggingKey) return;
      const currentIndicator = dropIndicatorRef.current;
      if (!currentIndicator) {
        draggingBlockKeyRef.current = null;
        setDraggingBlockKey(null);
        setDropIndicator(null);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        return;
      }

      editor.update(() => {
        const draggedNode = $getNodeByKey(draggingKey);
        if (!draggedNode) return;

        const targetTopLevelNode = $getNodeByKey(currentIndicator.targetKey);
        if (!targetTopLevelNode) return;
        if (targetTopLevelNode.getKey() === draggedNode.getKey()) return;

        if (currentIndicator.insertAfter) {
          targetTopLevelNode.insertAfter(draggedNode);
        } else {
          targetTopLevelNode.insertBefore(draggedNode);
        }

        if ($isTableNode(draggedNode)) {
          editor.dispatchCommand(SET_SELECTED_TABLE_KEY_COMMAND, draggedNode.getKey());
        } else {
          editor.dispatchCommand(SET_SELECTED_TABLE_KEY_COMMAND, null);
        }
        focusMovedNode(draggedNode);
      });

      draggingBlockKeyRef.current = null;
      setDraggingBlockKey(null);
      setDropIndicator(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      refreshActiveBlock();
    };

    const onMouseLeaveWindow = (event: MouseEvent) => {
      if (!draggingBlockKeyRef.current) return;
      const next = event.relatedTarget as Node | null;
      if (!next) {
        setDropIndicator(null);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeaveWindow);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeaveWindow);
    };
  }, [editor, focusMovedNode, overlayRect, refreshActiveBlock]);

  useEffect(() => {
      editor.getEditorState().read(() => {
        const prevNode = selectedBlockKey ? $getNodeByKey(selectedBlockKey) : null;
        if (!prevNode) return;
        const prevEl = editor.getElementByKey(prevNode.getKey());
        if (!prevEl) return;
        resolveVisualElement(prevEl).classList.remove(
          "ring-2",
          "ring-indigo-400",
          "ring-offset-2"
        );
      });

    if (!selectedBlockKey) return;
    editor.getEditorState().read(() => {
      const node = $getNodeByKey(selectedBlockKey);
      if (!node) return;
      const blockEl = editor.getElementByKey(node.getKey());
      if (!blockEl) return;
      resolveVisualElement(blockEl).classList.add(
        "ring-2",
        "ring-indigo-400",
        "ring-offset-2"
      );
    });

    return () => {
      if (!selectedBlockKey) return;
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(selectedBlockKey);
        if (!node) return;
        const blockEl = editor.getElementByKey(node.getKey());
        if (!blockEl) return;
        resolveVisualElement(blockEl).classList.remove(
          "ring-2",
          "ring-indigo-400",
          "ring-offset-2"
        );
      });
    };
  }, [editor, selectedBlockKey]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-table-block-selector]")) return;
      if (target.closest("[data-editor-toolbar]")) return;
      clearSelectedTable();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [clearSelectedTable]);

  const canShow = useMemo(() => {
    if (!overlayRect) return false;
    const minVisibleTop = overlayRect.top + HANDLE_TOP_PADDING;
    const maxVisibleBottom = overlayRect.bottom - HANDLE_TOP_PADDING;
    return (
      activeBlock &&
      activeBlock.rect.bottom >= minVisibleTop &&
      activeBlock.rect.top <= maxVisibleBottom &&
      Number.isFinite(activeBlock.rect.top) &&
      Number.isFinite(activeBlock.rect.left)
    );
  }, [activeBlock, overlayRect]);

  if (!canShow || !activeBlock || !overlayRect) return null;

  const handleSize = 8;
  const top = activeBlock.rect.top + activeBlock.rect.height / 2;
  const minTop = overlayRect.top + HANDLE_TOP_PADDING;
  const maxTop = overlayRect.bottom - HANDLE_TOP_PADDING - handleSize;
  const clampedTop = Math.max(
    minTop,
    Math.min(top - handleSize / 2, maxTop)
  );
  const left = overlayRect.left + (HANDLE_GUTTER_WIDTH - handleSize) / 2;
  const indicatorLeft = overlayRect.left + HANDLE_GUTTER_WIDTH;
  const indicatorWidth = Math.max(
    12,
    overlayRect.width - HANDLE_GUTTER_WIDTH - EDITOR_RIGHT_PADDING
  );

  return (
    <>
      {dropIndicator && (
        <div
          className="pointer-events-none fixed z-30"
          style={{
            top: Math.max(overlayRect.top + HANDLE_TOP_PADDING, dropIndicator.top - 1),
            left: indicatorLeft,
            width: indicatorWidth,
          }}
        >
          <div className="h-[2px] w-full rounded-full bg-indigo-500/90" />
          <div className="-mt-[5px] h-[8px] w-[8px] rounded-full bg-indigo-500/90" />
        </div>
      )}
      <button
        type="button"
        data-table-block-selector
        aria-label="블록 선택"
        className={`fixed z-40 inline-flex box-border items-center justify-center rounded-full border border-slate-400 bg-transparent text-muted-foreground hover:border-slate-500 cursor-grab active:cursor-grabbing ${
          selectedBlockKey === activeBlock.key ? "ring-2 ring-indigo-400" : ""
        }`}
        style={{
          top: clampedTop,
          left,
          width: handleSize,
          height: handleSize,
        }}
        onClick={(event) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          const next = selectedBlockKey === activeBlock.key ? null : activeBlock.key;

          setSelectedBlockKey(next);
          editor.dispatchCommand(
            SET_SELECTED_TABLE_KEY_COMMAND,
            next && activeBlock.isTable ? next : null
          );

          if (!next) return;
          editor.update(() => {
            const node = $getNodeByKey(next);
            if (!node) return;
            focusMovedNode(node);
          });
        }}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          draggingBlockKeyRef.current = activeBlock.key;
          setDraggingBlockKey(activeBlock.key);
          setDropIndicator(null);
          suppressClickRef.current = false;
          document.body.style.cursor = "grabbing";
          document.body.style.userSelect = "none";
        }}
        onMouseUp={() => {
          if (!draggingBlockKeyRef.current) return;
          draggingBlockKeyRef.current = null;
          setDraggingBlockKey(null);
          setDropIndicator(null);
          document.body.style.cursor = "";
          document.body.style.userSelect = "";
        }}
      />
    </>
  );
}
