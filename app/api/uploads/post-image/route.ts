import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadOptimizedPostImage } from "@/lib/post-images";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const draftId = formData.get("draftId");
    const postId = formData.get("postId");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "이미지 파일이 필요합니다." },
        { status: 400 },
      );
    }

    const result = await uploadOptimizedPostImage({
      file,
      draftId: typeof draftId === "string" ? draftId : null,
      postId: typeof postId === "string" ? postId : null,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading post image:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "이미지 업로드에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
