import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const {
      title,
      slug,
      subtitle,
      content,
      tags,
      author_name,
      author_role,
      author_avatar,
      read_time,
      like_count,
      status, // 'draft' | 'unlisted' | 'published'
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "제목과 슬러그는 필수입니다." },
        { status: 400 }
      );
    }

    // Determine is_visible and published_at based on status
    let is_visible = false;
    let published_at: string | null = null;

    if (status === "published") {
      is_visible = true;
      published_at = new Date().toISOString();
    } else if (status === "unlisted") {
      is_visible = false;
      published_at = new Date().toISOString();
    }
    // draft: is_visible = false, published_at = null (default)

    const { data, error } = await supabase
      .from("dinn_posts")
      .insert({
        title,
        slug,
        description: subtitle,
        content,
        tags,
        author_name: author_name || null,
        author_role: author_role || null,
        author_avatar: author_avatar || null,
        read_time: typeof read_time === "number" ? read_time : 0,
        like_count: typeof like_count === "number" ? like_count : 0,
        is_visible,
        published_at,
      })
      .select();

    if (error) {
      console.error("Error creating post:", error);

      // Handle duplicate slug error
      if (error.code === "23505" && error.details?.includes("slug")) {
        return NextResponse.json(
          { error: "이미 같은 제목의 게시글이 존재합니다. 다른 제목을 사용해주세요." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const post = data?.[0];
    if (!post) {
      return NextResponse.json(
        { error: "게시글 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    revalidateTag("table:dinn_posts", { expire: 0 });
    return NextResponse.json({ data: post, status: getStatusFromPost(post) });
  } catch (error) {
    console.error("Error in POST /api/posts:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

function getStatusFromPost(post: { is_visible: boolean | null; published_at: string | null }) {
  if (post.is_visible) return "published";
  if (post.published_at) return "unlisted";
  return "draft";
}
