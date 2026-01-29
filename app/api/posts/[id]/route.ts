import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabase } from "@/lib/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    if (!title) {
      return NextResponse.json(
        { error: "제목은 필수입니다." },
        { status: 400 }
      );
    }

    // Get current post to preserve published_at if needed
    const { data: currentPosts } = await supabase
      .from("dinn_posts")
      .select("published_at")
      .eq("id", id);

    const currentPost = currentPosts?.[0];

    // Determine is_visible and published_at based on status
    let is_visible = false;
    let published_at: string | null = currentPost?.published_at || null;

    if (status === "published") {
      is_visible = true;
      // Set published_at only if not already set
      if (!published_at) {
        published_at = new Date().toISOString();
      }
    } else if (status === "unlisted") {
      is_visible = false;
      // Set published_at only if not already set (was published before)
      if (!published_at) {
        published_at = new Date().toISOString();
      }
    } else if (status === "draft") {
      is_visible = false;
      published_at = null; // Reset to draft
    }

    const updateData: Record<string, any> = {
      title,
      description: subtitle,
      content,
      tags,
      is_visible,
      published_at,
      updated_at: new Date().toISOString(),
    };

    // Only update slug if provided
    if (slug) {
      updateData.slug = slug;
    }
    if (author_name !== undefined) {
      updateData.author_name = author_name || null;
    }
    if (author_role !== undefined) {
      updateData.author_role = author_role || null;
    }
    if (author_avatar !== undefined) {
      updateData.author_avatar = author_avatar || null;
    }
    if (typeof read_time === "number") {
      updateData.read_time = read_time;
    }
    if (typeof like_count === "number") {
      updateData.like_count = like_count;
    }

    const { data, error } = await supabase
      .from("dinn_posts")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating post:", error);

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
        { error: "게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    revalidateTag("table:dinn_posts", { expire: 0 });
    return NextResponse.json({ data: post, status: getStatusFromPost(post) });
  } catch (error) {
    console.error("Error in PUT /api/posts/[id]:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from("dinn_posts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting post:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    revalidateTag("table:dinn_posts", { expire: 0 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/posts/[id]:", error);
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
