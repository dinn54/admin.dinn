import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { moveTempPostImages } from "@/lib/post-images";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content, draftId, postId } = body;

    if (typeof content !== "string" || typeof postId !== "string") {
      return NextResponse.json(
        { error: "content와 postId가 필요합니다." },
        { status: 400 },
      );
    }

    const result = await moveTempPostImages({
      content,
      draftId: typeof draftId === "string" ? draftId : null,
      postId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error committing post images:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "이미지 경로 정리에 실패했습니다.",
      },
      { status: 500 },
    );
  }
}
