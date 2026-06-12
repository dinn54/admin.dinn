import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import { notify } from "@/lib/notifications";
import { createPostSlug } from "@/lib/post-slug";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const {
      title,
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

    // Get current post to preserve published_at and describe status transitions.
    const { data: currentPosts } = await supabase
      .from("dinn_posts")
      .select("title, slug, is_visible, published_at")
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

    const updateData: Record<string, unknown> = {
      title,
      slug: createPostSlug(title),
      description: subtitle,
      content,
      tags,
      is_visible,
      published_at,
      updated_at: new Date().toISOString(),
    };

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
          {
            error: `같은 URL 경로를 사용하는 게시글이 이미 존재합니다. 제목을 다르게 입력해주세요. 생성된 경로: ${getPostPath(String(updateData.slug))}`,
          },
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

    // 태그 연결 처리
    if (tags && Array.isArray(tags)) {
      await syncPostTags(id, tags);
    }

    revalidateTag("table:dinn_posts", { expire: 0 });
    const oldStatus = currentPost ? getStatusFromPost(currentPost) : null;
    const newStatus = getStatusFromPost(post);
    notify({
      title: getUpdateNotificationTitle(oldStatus, newStatus),
      icon: getUpdateNotificationIcon(oldStatus, newStatus),
      message: post.title,
      level: "success",
      fields: [
        {
          name: "상태",
          value: formatStatusChange(oldStatus, newStatus),
          inline: true,
        },
        {
          name: "경로",
          value: formatPathChange(currentPost?.slug ?? null, post.slug),
          inline: false,
        },
        { name: "Post ID", value: post.id, inline: false },
      ],
    });
    return NextResponse.json({ data: post, status: newStatus });
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
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const { data: postToDelete } = await supabase
      .from("dinn_posts")
      .select("title, slug, is_visible, published_at")
      .eq("id", id)
      .single();

    // 태그 연결 먼저 삭제 (트리거가 count 감소시킴)
    await supabase
      .from("dinn_post_tags_connect")
      .delete()
      .eq("post_id", id);

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
    notify({
      title: "글 삭제 완료",
      icon: "🗑️",
      message: postToDelete?.title ?? id,
      level: "success",
      fields: [
        {
          name: "상태",
          value: postToDelete ? getStatusFromPost(postToDelete) : "-",
          inline: true,
        },
        {
          name: "경로",
          value: getPostPath(postToDelete?.slug ?? null),
          inline: false,
        },
        { name: "Post ID", value: id, inline: false },
      ],
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/posts/[id]:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

type PostStatus = "draft" | "unlisted" | "published";

function getStatusFromPost(post: {
  is_visible: boolean | null;
  published_at: string | null;
}): PostStatus {
  if (post.is_visible) return "published";
  if (post.published_at) return "unlisted";
  return "draft";
}

function getUpdateNotificationTitle(
  oldStatus: PostStatus | null,
  newStatus: PostStatus,
) {
  if (oldStatus !== "published" && newStatus === "published") {
    return "글 출간 완료";
  }
  if (oldStatus === "published" && newStatus === "unlisted") {
    return "글 숨김 완료";
  }
  if (oldStatus === "published" && newStatus === "draft") {
    return "글 초안 전환 완료";
  }
  if (oldStatus === "draft" && newStatus === "unlisted") {
    return "숨김 글 등록 완료";
  }
  if (oldStatus === "unlisted" && newStatus === "draft") {
    return "숨김 글 초안 전환 완료";
  }
  return "글 수정 완료";
}

function getUpdateNotificationIcon(
  oldStatus: PostStatus | null,
  newStatus: PostStatus,
) {
  if (oldStatus !== "published" && newStatus === "published") return "🚀";
  if (oldStatus === "published" && newStatus !== "published") return "🙈";
  return "✏️";
}

function formatStatusChange(
  oldStatus: PostStatus | null,
  newStatus: PostStatus,
) {
  if (!oldStatus || oldStatus === newStatus) return newStatus;
  return `${oldStatus} → ${newStatus}`;
}

function getPostPath(slug: string | null) {
  return slug ? `/posts/${slug}` : "-";
}

function formatPathChange(oldSlug: string | null, newSlug: string | null) {
  const oldPath = getPostPath(oldSlug);
  const newPath = getPostPath(newSlug);
  if (oldPath === newPath) return newPath;
  return `${oldPath} → ${newPath}`;
}

async function syncPostTags(postId: string, tags: string[]) {
  try {
    // 1. 기존 태그 연결 조회
    const { data: existingConnections } = await supabase
      .from("dinn_post_tags_connect")
      .select("tag_id, dinn_post_tags(name)")
      .eq("post_id", postId);

    type PostTagConnection = {
      tag_id: string;
      dinn_post_tags?: { name?: string | null } | null;
    };

    const connections = (existingConnections ?? []) as PostTagConnection[];
    const existingTagNames = new Set(
      connections
        .map((connection) => connection.dinn_post_tags?.name)
        .filter((name): name is string => typeof name === "string"),
    );
    const newTagNames = new Set(tags);

    // 2. 삭제할 태그 연결 찾기
    const tagsToRemove = connections.filter((connection) => {
      const name = connection.dinn_post_tags?.name;
      return typeof name === "string" && !newTagNames.has(name);
    });

    // 3. 추가할 태그 찾기
    const tagsToAdd = tags.filter((tag) => !existingTagNames.has(tag));

    // 4. 삭제할 연결 제거 (트리거가 count 감소시킴)
    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((connection) => connection.tag_id);
      await supabase
        .from("dinn_post_tags_connect")
        .delete()
        .eq("post_id", postId)
        .in("tag_id", tagIdsToRemove);
    }

    // 5. 새 태그 추가
    for (const tagName of tagsToAdd) {
      // 태그가 존재하는지 확인
      let { data: existingTag } = await supabase
        .from("dinn_post_tags")
        .select("id")
        .eq("name", tagName)
        .single();

      // 태그가 없으면 생성
      if (!existingTag) {
        const { data: newTag } = await supabase
          .from("dinn_post_tags")
          .insert({ name: tagName, count: 0 })
          .select("id")
          .single();
        existingTag = newTag;
      }

      // 연결 생성 (트리거가 count 증가시킴)
      if (existingTag) {
        await supabase
          .from("dinn_post_tags_connect")
          .insert({ post_id: postId, tag_id: existingTag.id });
      }
    }
  } catch (error) {
    console.error("Error syncing post tags:", error);
  }
}
