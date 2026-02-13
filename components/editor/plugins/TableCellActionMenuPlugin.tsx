"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $isTableSelection,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableRowNode,
  TableCellNode,
  TableCellHeaderStates,
} from "@lexical/table";
import { Settings2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ActiveCellState = {
  keys: string[];
  rect: DOMRect;
  backgroundColor: string;
  verticalAlign: string;
};

const DEFAULT_CELL_BG = "#ffffff";
const DEFAULT_HEADER_BG = "#f8fafc";

function getSelectedTableCellsFromSelection(): TableCellNode[] {
  const selection = $getSelection();
  if (!selection) return [];

  if ($isRangeSelection(selection)) {
    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();
    const cell =
      $getTableCellNodeFromLexicalNode(anchorNode) ||
      $getTableCellNodeFromLexicalNode(focusNode);
    return cell ? [cell] : [];
  }

  if ($isTableSelection(selection)) {
    const cellMap = new Map<string, TableCellNode>();
    const anchorCell = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());
    if (anchorCell) {
      cellMap.set(anchorCell.getKey(), anchorCell);
    }
    const focusCell = $getTableCellNodeFromLexicalNode(selection.focus.getNode());
    if (focusCell) {
      cellMap.set(focusCell.getKey(), focusCell);
    }
    for (const node of selection.getNodes()) {
      const cell = $getTableCellNodeFromLexicalNode(node);
      if (cell) {
        cellMap.set(cell.getKey(), cell);
      }
    }
    return Array.from(cellMap.values());
  }

  return [];
}

export default function TableCellActionMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeCell, setActiveCell] = useState<ActiveCellState | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const activeCellRef = useRef<ActiveCellState | null>(null);
  const rafRef = useRef<number | null>(null);
  const isColorPickingRef = useRef(false);
  const colorApplyRafRef = useRef<number | null>(null);
  const pendingColorRef = useRef<string | null>(null);

  useEffect(() => {
    activeCellRef.current = activeCell;
  }, [activeCell]);

  const refreshActiveCell = useCallback((forceGeometry = false) => {
    editor.getEditorState().read(() => {
      const tableCells = getSelectedTableCellsFromSelection();
      if (tableCells.length === 0) {
        setActiveCell(null);
        return;
      }

      const nextKeys = tableCells.map((cell) => cell.getKey());
      const firstCell = tableCells[0];
      const backgroundColor =
        firstCell.getBackgroundColor() ||
        (firstCell.hasHeader() ? DEFAULT_HEADER_BG : DEFAULT_CELL_BG);
      const verticalAlign = firstCell.getVerticalAlign() || "top";
      const prev = activeCellRef.current;
      const sameSelection =
        !!prev &&
        prev.keys.length === nextKeys.length &&
        prev.keys.every((key, index) => key === nextKeys[index]);

      // Most color-drag updates don't need geometry recalculation.
      if (sameSelection && !forceGeometry && prev) {
        if (
          prev.backgroundColor !== backgroundColor ||
          prev.verticalAlign !== verticalAlign
        ) {
          setActiveCell({
            ...prev,
            backgroundColor,
            verticalAlign,
          });
        }
        return;
      }

      const cellRects = tableCells
        .map(
          (cell) =>
            editor.getElementByKey(cell.getKey())?.getBoundingClientRect() ?? null
        )
        .filter((rect): rect is DOMRect => rect !== null);
      if (cellRects.length === 0) {
        setActiveCell(null);
        return;
      }

      const minTop = Math.min(...cellRects.map((rect) => rect.top));
      const minLeft = Math.min(...cellRects.map((rect) => rect.left));
      const maxRight = Math.max(...cellRects.map((rect) => rect.right));
      const maxBottom = Math.max(...cellRects.map((rect) => rect.bottom));
      setActiveCell({
        keys: nextKeys,
        rect: new DOMRect(minLeft, minTop, maxRight - minLeft, maxBottom - minTop),
        backgroundColor,
        verticalAlign,
      });
    });
  }, [editor]);

  const scheduleRefreshActiveCell = useCallback(
    (forceGeometry = false) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        refreshActiveCell(forceGeometry);
      });
    },
    [refreshActiveCell]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          scheduleRefreshActiveCell(true);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerUpdateListener(() => {
        if (isColorPickingRef.current) return;
        scheduleRefreshActiveCell(false);
      })
    );
  }, [editor, scheduleRefreshActiveCell]);

  useEffect(() => {
    const onWindowChange = () => scheduleRefreshActiveCell(true);
    window.addEventListener("resize", onWindowChange);
    window.addEventListener("scroll", onWindowChange, true);
    return () => {
      window.removeEventListener("resize", onWindowChange);
      window.removeEventListener("scroll", onWindowChange, true);
    };
  }, [scheduleRefreshActiveCell]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (colorApplyRafRef.current !== null) {
        cancelAnimationFrame(colorApplyRafRef.current);
      }
    };
  }, []);

  const applyPendingColor = useCallback(() => {
    const color = pendingColorRef.current;
    if (!color) return;
    const cellKeys = activeCellRef.current?.keys ?? [];
    if (cellKeys.length === 0) return;
    editor.update(() => {
      for (const key of cellKeys) {
        const cellNode = $getNodeByKey(key);
        if (!$isTableCellNode(cellNode)) continue;
        cellNode.setBackgroundColor(color);
      }
    });
  }, [editor]);

  const flushColorPicking = useCallback(() => {
    if (!isColorPickingRef.current) return;
    if (colorApplyRafRef.current !== null) {
      cancelAnimationFrame(colorApplyRafRef.current);
      colorApplyRafRef.current = null;
    }
    applyPendingColor();
    pendingColorRef.current = null;
    isColorPickingRef.current = false;
    scheduleRefreshActiveCell(false);
  }, [applyPendingColor, scheduleRefreshActiveCell]);

  useEffect(() => {
    const onPointerUp = () => flushColorPicking();
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("mouseup", onPointerUp, true);
    return () => {
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("mouseup", onPointerUp, true);
    };
  }, [flushColorPicking]);

  const queueBackgroundColorChange = useCallback(
    (color: string) => {
      const prev = activeCellRef.current;
      if (prev && prev.backgroundColor !== color) {
        setActiveCell({ ...prev, backgroundColor: color });
      }
      isColorPickingRef.current = true;
      pendingColorRef.current = color;
      if (colorApplyRafRef.current !== null) return;
      colorApplyRafRef.current = requestAnimationFrame(() => {
        colorApplyRafRef.current = null;
        applyPendingColor();
      });
    },
    [applyPendingColor]
  );

  const runInUpdate = useCallback(
    (fn: (cellNode: TableCellNode) => void, mode: "all" | "primary" = "primary") => {
      const cellKeys = activeCell?.keys ?? [];
      if (cellKeys.length === 0) return;
      editor.update(() => {
        const targetKeys = mode === "all" ? cellKeys : [cellKeys[0]];
        for (const key of targetKeys) {
          const cellNode = $getNodeByKey(key);
          if (!$isTableCellNode(cellNode)) continue;
          fn(cellNode);
        }
      });
    },
    [activeCell?.keys, editor]
  );

  const canShow = useMemo(() => {
    return (
      activeCell &&
      Number.isFinite(activeCell.rect.top) &&
      Number.isFinite(activeCell.rect.left)
    );
  }, [activeCell]);

  if (!canShow || !activeCell) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        top: Math.max(8, activeCell.rect.top + 4),
        left: Math.max(8, activeCell.rect.right - 34),
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="테이블 셀 설정"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-background text-foreground shadow-sm hover:bg-accent"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 !max-h-none !overflow-visible">
          <DropdownMenuGroup>
            <div className="text-muted-foreground px-2 py-1.5 text-xs">
              표 설정
            </div>
          </DropdownMenuGroup>
          <div className="px-2 py-1.5">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium">배경색</label>
              <button
                type="button"
                aria-label="배경색 선택"
                className="h-4 w-4 rounded-full border border-slate-300"
                style={{ backgroundColor: activeCell.backgroundColor }}
                onClick={() => {
                  colorInputRef.current?.click();
                }}
              />
            </div>
            <input
              ref={colorInputRef}
              type="color"
              value={activeCell.backgroundColor}
              onInput={(e) =>
                queueBackgroundColorChange(
                  (e.target as HTMLInputElement).value
                )
              }
              onChange={(e) =>
                queueBackgroundColorChange(
                  (e.target as HTMLInputElement).value
                )
              }
              onBlur={() => flushColorPicking()}
              className="sr-only"
            />
          </div>
          <DropdownMenuGroup>
            <div className="text-muted-foreground px-2 pb-1 text-xs">
              세로 정렬
            </div>
          </DropdownMenuGroup>
          <div className="grid grid-cols-3 gap-1 px-2 pb-1">
            {[
              { value: "top", label: "위" },
              { value: "middle", label: "가운데" },
              { value: "bottom", label: "아래" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={`h-7 rounded-md border text-xs ${
                  activeCell.verticalAlign === option.value
                    ? "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300"
                    : "border-border bg-background hover:bg-accent"
                }`}
                onClick={() =>
                  runInUpdate((cell) => cell.setVerticalAlign(option.value), "all")
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => runInUpdate(() => void $insertTableRowAtSelection(false))}>
            위에 행 추가
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => runInUpdate(() => void $insertTableRowAtSelection(true))}>
            아래에 행 추가
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => runInUpdate(() => void $insertTableColumnAtSelection(false))}>
            왼쪽에 열 추가
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => runInUpdate(() => void $insertTableColumnAtSelection(true))}>
            오른쪽에 열 추가
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => runInUpdate(() => $deleteTableColumnAtSelection())}>
            열 삭제
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => runInUpdate(() => $deleteTableRowAtSelection())}>
            행 삭제
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              runInUpdate((cell) => {
                const table = $getTableNodeFromLexicalNodeOrThrow(cell);
                const firstRow = table.getFirstChild();
                if (!$isTableRowNode(firstRow)) return;
                const firstCell = firstRow.getFirstChild();
                const enable =
                  !$isTableCellNode(firstCell) ||
                  !firstCell.hasHeaderState(TableCellHeaderStates.ROW);

                firstRow.getChildren().forEach((cellNode) => {
                  if ($isTableCellNode(cellNode)) {
                    cellNode.setHeaderStyles(
                      enable
                        ? TableCellHeaderStates.ROW
                        : TableCellHeaderStates.NO_STATUS,
                      TableCellHeaderStates.ROW
                    );
                  }
                });
              })
            }
          >
            행 헤더 토글
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              runInUpdate((cell) => {
                const table = $getTableNodeFromLexicalNodeOrThrow(cell);
                const firstRow = table.getFirstChild();
                if (!$isTableRowNode(firstRow)) return;
                const firstCell = firstRow.getFirstChild();
                const enable =
                  !$isTableCellNode(firstCell) ||
                  !firstCell.hasHeaderState(TableCellHeaderStates.COLUMN);

                table.getChildren().forEach((row) => {
                  if (!$isTableRowNode(row)) return;
                  const target = row.getFirstChild();
                  if ($isTableCellNode(target)) {
                    target.setHeaderStyles(
                      enable
                        ? TableCellHeaderStates.COLUMN
                        : TableCellHeaderStates.NO_STATUS,
                      TableCellHeaderStates.COLUMN
                    );
                  }
                });
              })
            }
          >
            열 헤더 토글
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() =>
              runInUpdate((cell) => {
                const table = $getTableNodeFromLexicalNodeOrThrow(cell);
                table.remove();
              })
            }
            className="text-red-600 focus:text-red-600"
          >
            표 삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
