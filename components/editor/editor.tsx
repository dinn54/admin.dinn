"use client";

import type { LexicalEditor } from "lexical";
import { useCallback } from "react";
import { Editor as SharedEditor } from "dinn-lexical/react";
import type { ImageUploadHandler } from "dinn-lexical/react";
import { toast } from "sonner";

import TableCellActionMenuPlugin from "./plugins/TableCellActionMenuPlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizerPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { InsertPlugin } from "./plugins/insert-plugin";
import { uploadPostImage } from "@/lib/post-image-upload-client";

interface EditorProps {
  readOnly?: boolean;
  initialEditorState?: string | null;
  content?: string;
  markdown?: string;
  onInit?: (editor: LexicalEditor) => void;
  onChange?: (value: string) => void;
  outputFormat?: "markdown" | "json";
  className?: string;
  imageUploadDraftId?: string;
  imageUploadPostId?: string | null;
}

export function Editor(props: EditorProps) {
  const {
    imageUploadDraftId,
    imageUploadPostId,
    ...sharedEditorProps
  } = props;
  const handleImageUpload = useCallback<ImageUploadHandler>(
    async (file) => {
      if (!imageUploadDraftId) {
        throw new Error("이미지 업로드를 위한 draftId가 없습니다.");
      }

      const uploaded = await uploadPostImage({
        file,
        draftId: imageUploadDraftId,
        postId: imageUploadPostId,
      });

      return {
        src: uploaded.url,
        altText: file.name,
        width: uploaded.width,
        height: uploaded.height,
      };
    },
    [imageUploadDraftId, imageUploadPostId],
  );

  return (
    <SharedEditor
      {...sharedEditorProps}
      namespace="AdminDinnEditor"
      onImageUpload={imageUploadDraftId ? handleImageUpload : undefined}
      onImageUploadError={(error) => {
        console.error("Image upload error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "이미지 업로드에 실패했습니다.",
        );
      }}
      toolbar={
        <ToolbarPlugin
          imageUploadDraftId={imageUploadDraftId}
          imageUploadPostId={imageUploadPostId}
        />
      }
      editablePlugins={
        <>
          <InsertPlugin />
          <TableCellActionMenuPlugin />
          <TableCellResizerPlugin />
        </>
      }
    />
  );
}
