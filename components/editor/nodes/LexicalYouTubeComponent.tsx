"use client";
import React, { useState, useCallback, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_DELETE_COMMAND,
  KEY_BACKSPACE_COMMAND,
  NodeKey,
} from "lexical";
import { $isYouTubeNode } from "./YouTubeNode";

export default function LexicalYouTubeComponent({
  className,
  format,
  nodeKey,
  videoID,
  width,
}: {
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: string | null;
  nodeKey: NodeKey;
  videoID: string;
  width: number;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width || 560);
  const isEditable = editor.isEditable();

  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload;
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if (node) {
          node.remove();
        }
        return true;
      }
      return false;
    },
    [isSelected, nodeKey]
  );

  const handleResizeStart = useCallback(
    (event: React.MouseEvent, direction: "left" | "right") => {
      event.preventDefault();
      event.stopPropagation();
      setIsResizing(true);

      const startX = event.clientX;
      const startWidth = currentWidth;
      let finalWidth = startWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = direction === "right" ? e.clientX - startX : startX - e.clientX;
        finalWidth = Math.max(200, Math.min(800, startWidth + deltaX));
        setCurrentWidth(finalWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        // Update the node with the new width
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isYouTubeNode(node)) {
            node.setWidth(finalWidth);
          }
        });
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [currentWidth, editor, nodeKey]
  );

  React.useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          if (
            containerRef.current?.contains(event.target as Node) &&
            !(event.target as HTMLElement).classList.contains("resize-handle")
          ) {
            clearSelection();
            setSelected(true);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
    );
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

  // Sync width from props
  React.useEffect(() => {
    if (width !== currentWidth && !isResizing) {
      setCurrentWidth(width);
    }
  }, [width, isResizing]);

  return (
    <div
      ref={containerRef}
      className={`youtube-wrapper relative my-4 inline-block rounded-lg bg-transparent ${
        isSelected && isEditable ? "ring-2 ring-indigo-500" : ""
      }`}
      style={{
        width: `${currentWidth}px`,
        maxWidth: "100%",
        padding: isEditable ? "8px" : "0",
      }}
    >
      {/* Click overlay - only in edit mode to catch clicks before iframe */}
      {isEditable && (
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            clearSelection();
            setSelected(true);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setSelected(false);
          }}
        />
      )}
      {/* Visual border indicator for clickable area - only in edit mode */}
      {isEditable && (
        <div
          className={`absolute inset-0 rounded-lg border-2 border-dashed transition-colors pointer-events-none ${
            isSelected ? "border-indigo-400" : "border-transparent hover:border-slate-300"
          }`}
        />
      )}
      <div className="relative rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoID}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={true}
          title="YouTube video player"
          className="w-full aspect-video"
          style={{ pointerEvents: isEditable ? "none" : "auto" }}
        />
      </div>
      {/* Resize Handles - only show when selected and editable */}
      {isSelected && isEditable && (
        <>
          <div
            className="resize-handle absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center hover:bg-indigo-500/20 transition-colors z-20"
            onMouseDown={(e) => handleResizeStart(e, "left")}
          >
            <div className="w-1 h-10 bg-indigo-500 rounded-full opacity-80" />
          </div>
          <div
            className="resize-handle absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize flex items-center justify-center hover:bg-indigo-500/20 transition-colors z-20"
            onMouseDown={(e) => handleResizeStart(e, "right")}
          >
            <div className="w-1 h-10 bg-indigo-500 rounded-full opacity-80" />
          </div>
        </>
      )}
      {/* Hint text when not selected - only in edit mode */}
      {!isSelected && isEditable && (
        <div className="absolute bottom-2 right-2 text-xs text-slate-400 bg-white/80 px-2 py-1 rounded z-20 pointer-events-none">
          클릭하여 선택
        </div>
      )}
    </div>
  );
}
