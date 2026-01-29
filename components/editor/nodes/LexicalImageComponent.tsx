"use client";
import React, { Suspense, useRef, useState, useCallback } from "react";
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
import { $isImageNode } from "./ImageNode";

const imageCache = new Set();

function useSuspenseImage(src: string) {
  if (!imageCache.has(src)) {
    throw new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.add(src);
        resolve(null);
      };
    });
  }
}

function LazyImage({
  altText,
  className,
  imageRef,
  src,
  width,
}: {
  altText: string;
  className: string | null;
  imageRef: { current: null | HTMLImageElement };
  src: string;
  width: number;
}) {
  useSuspenseImage(src);
  return (
    <img
      className={className || undefined}
      src={src}
      alt={altText}
      ref={imageRef}
      style={{
        width: `${width}px`,
        height: "auto",
        maxWidth: "100%",
      }}
      draggable="false"
    />
  );
}

export default function LexicalImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  showCaption,
  caption,
  captionsEnabled,
}: {
  src: string;
  altText: string;
  nodeKey: NodeKey;
  width: "inherit" | number;
  height: "inherit" | number;
  maxWidth: number;
  showCaption: boolean;
  caption: any;
  captionsEnabled: boolean;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const imageRef = useRef<null | HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(
    typeof width === "number" ? width : 500
  );
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
        finalWidth = Math.max(100, Math.min(800, startWidth + deltaX));
        setCurrentWidth(finalWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        // Update the node with the new width
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            node.setWidthAndHeight(finalWidth, "inherit");
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
            if (event.shiftKey) {
              setSelected(!isSelected);
            } else {
              clearSelection();
              setSelected(true);
            }
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
    if (typeof width === "number" && width !== currentWidth && !isResizing) {
      setCurrentWidth(width);
    }
  }, [width, isResizing]);

  return (
    <Suspense
      fallback={<div className="w-full h-[300px] bg-slate-100 animate-pulse" />}
    >
      <div
        ref={containerRef}
        className={`relative inline-block ${isSelected && isEditable ? "ring-2 ring-indigo-500 rounded-lg" : ""}`}
        style={{ width: `${currentWidth}px`, maxWidth: "100%" }}
      >
        <LazyImage
          className="w-full h-auto rounded-lg shadow-sm"
          src={src}
          altText={altText}
          imageRef={imageRef}
          width={currentWidth}
        />
        {/* Resize Handles - only show when selected and editable */}
        {isSelected && isEditable && (
          <>
            <div
              className="resize-handle absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center hover:bg-indigo-500/20 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, "left")}
            >
              <div className="w-1 h-8 bg-indigo-500 rounded-full opacity-70" />
            </div>
            <div
              className="resize-handle absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center hover:bg-indigo-500/20 transition-colors"
              onMouseDown={(e) => handleResizeStart(e, "right")}
            >
              <div className="w-1 h-8 bg-indigo-500 rounded-full opacity-70" />
            </div>
          </>
        )}
      </div>
    </Suspense>
  );
}
