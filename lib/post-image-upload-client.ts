"use client";

export type UploadedPostImage = {
  url: string;
  width?: number | null;
  height?: number | null;
};

export async function uploadPostImage({
  file,
  draftId,
  postId,
}: {
  file: File;
  draftId: string;
  postId?: string | null;
}) {
  const formData = new FormData();
  formData.set("file", file);

  if (postId) {
    formData.set("postId", postId);
  } else {
    formData.set("draftId", draftId);
  }

  const response = await fetch("/api/uploads/post-image", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error || "이미지 업로드에 실패했습니다.");
  }

  return result as UploadedPostImage;
}
