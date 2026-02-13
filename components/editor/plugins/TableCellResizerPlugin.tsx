"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode } from "lexical";
import { $isTableCellNode, $isTableRowNode } from "@lexical/table";
import { useEffect, useRef } from "react";

const EDGE_HIT_AREA_PX = 8;
const MIN_CELL_WIDTH_PX = 80;
const MIN_ROW_HEIGHT_PX = 36;

function getClosestCellElement(
  target: EventTarget | null,
  root: HTMLElement
): HTMLTableCellElement | null {
  if (!(target instanceof HTMLElement)) return null;
  const cell = target.closest("td,th");
  if (!cell || !root.contains(cell)) return null;
  return cell as HTMLTableCellElement;
}

export default function TableCellResizerPlugin() {
  const [editor] = useLexicalComposerContext();
  const isResizingRef = useRef(false);
  const resizeModeRef = useRef<"col" | "row" | null>(null);
  const activeCellRef = useRef<HTMLTableCellElement | null>(null);
  const activeRowRef = useRef<HTMLTableRowElement | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const resetCursor = () => {
      root.style.cursor = "";
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!editor.isEditable()) return;

      if (isResizingRef.current) {
        if (resizeModeRef.current === "col" && activeCellRef.current) {
          const deltaX = event.clientX - startXRef.current;
          const nextWidth = Math.max(MIN_CELL_WIDTH_PX, startWidthRef.current + deltaX);
          activeCellRef.current.style.width = `${nextWidth}px`;
        } else if (resizeModeRef.current === "row" && activeRowRef.current) {
          const deltaY = event.clientY - startYRef.current;
          const nextHeight = Math.max(MIN_ROW_HEIGHT_PX, startHeightRef.current + deltaY);
          activeRowRef.current.style.height = `${nextHeight}px`;
        }
        return;
      }

      const cell = getClosestCellElement(event.target, root);
      if (!cell) {
        resetCursor();
        return;
      }

      const rect = cell.getBoundingClientRect();
      const distanceToRight = rect.right - event.clientX;
      const distanceToBottom = rect.bottom - event.clientY;
      if (distanceToBottom >= 0 && distanceToBottom <= EDGE_HIT_AREA_PX) {
        root.style.cursor = "row-resize";
      } else if (distanceToRight >= 0 && distanceToRight <= EDGE_HIT_AREA_PX) {
        root.style.cursor = "col-resize";
      } else {
        resetCursor();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (!editor.isEditable() || event.button !== 0) return;

      const cell = getClosestCellElement(event.target, root);
      if (!cell) return;

      const rect = cell.getBoundingClientRect();
      const distanceToRight = rect.right - event.clientX;
      const distanceToBottom = rect.bottom - event.clientY;
      const nearRight = distanceToRight >= 0 && distanceToRight <= EDGE_HIT_AREA_PX;
      const nearBottom = distanceToBottom >= 0 && distanceToBottom <= EDGE_HIT_AREA_PX;
      if (!nearRight && !nearBottom) return;

      event.preventDefault();
      event.stopPropagation();

      isResizingRef.current = true;
      if (nearBottom && (!nearRight || distanceToBottom <= distanceToRight)) {
        const row = cell.closest("tr") as HTMLTableRowElement | null;
        if (!row) {
          isResizingRef.current = false;
          return;
        }
        resizeModeRef.current = "row";
        activeRowRef.current = row;
        startYRef.current = event.clientY;
        startHeightRef.current = row.getBoundingClientRect().height;
        root.style.cursor = "row-resize";
      } else {
        resizeModeRef.current = "col";
        activeCellRef.current = cell;
        startXRef.current = event.clientX;
        startWidthRef.current = cell.getBoundingClientRect().width;
        root.style.cursor = "col-resize";
      }
      document.body.style.userSelect = "none";
    };

    const handleMouseUp = () => {
      if (!isResizingRef.current) return;

      if (resizeModeRef.current === "col" && activeCellRef.current) {
        const cellEl = activeCellRef.current;
        const finalWidth = Math.max(
          MIN_CELL_WIDTH_PX,
          Math.round(cellEl.getBoundingClientRect().width)
        );

        editor.update(() => {
          const maybeNode = $getNearestNodeFromDOMNode(cellEl);
          if ($isTableCellNode(maybeNode)) {
            maybeNode.setWidth(finalWidth);
          }
        });
      }

      if (resizeModeRef.current === "row" && activeRowRef.current) {
        const rowEl = activeRowRef.current;
        const finalHeight = Math.max(
          MIN_ROW_HEIGHT_PX,
          Math.round(rowEl.getBoundingClientRect().height)
        );

        editor.update(() => {
          const maybeNode = $getNearestNodeFromDOMNode(rowEl);
          if ($isTableRowNode(maybeNode)) {
            maybeNode.setHeight(finalHeight);
          }
        });
      }

      isResizingRef.current = false;
      resizeModeRef.current = null;
      activeCellRef.current = null;
      activeRowRef.current = null;
      document.body.style.userSelect = "";
      resetCursor();
    };

    root.addEventListener("mousemove", handleMouseMove);
    root.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    root.addEventListener("mouseleave", resetCursor);

    return () => {
      root.removeEventListener("mousemove", handleMouseMove);
      root.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      root.removeEventListener("mouseleave", resetCursor);
      document.body.style.userSelect = "";
      resetCursor();
    };
  }, [editor]);

  return null;
}
