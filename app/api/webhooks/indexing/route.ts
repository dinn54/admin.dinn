import { NextRequest, NextResponse } from "next/server";
import { requestIndexing, requestDeindexing } from "@/lib/google-indexing";
import { pingSitemaps } from "@/lib/sitemap-ping";
import { notify } from "@/lib/notifications";

interface WebhookRecord {
  slug?: string;
  title?: string | null;
  content?: string | null;
  is_visible?: boolean | null;
  published_at?: string | null;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: WebhookRecord | null;
  old_record: WebhookRecord | null;
}

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: WebhookPayload = await request.json();
  const { type, record, old_record } = payload;
  const getPostStatus = (
    value: WebhookRecord | null,
  ): "draft" | "unlisted" | "published" | null => {
    if (!value) return null;
    if (value.is_visible) return "published";
    if (value.published_at) return "unlisted";
    return "draft";
  };
  const hasTempImages = (value: WebhookRecord | null) =>
    typeof value?.content === "string" && value.content.includes("/posts/temp/");

  async function indexing(slug: string, action: "등록" | "수정") {
    try {
      await Promise.all([requestIndexing(slug), pingSitemaps()]);
      notify({
        title: `인덱싱 요청 완료 (${action})`,
        icon: "🔎",
        message: `/posts/${slug}`,
        level: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      notify({
        title: `인덱싱 요청 실패 (${action})`,
        icon: "🔎",
        message,
        level: "error",
        fields: [{ name: "경로", value: `/posts/${slug}`, inline: false }],
      });
      console.error(`[Google Indexing] 실패 (${action}):`, error);
    }
  }

  async function deindexing(
    slug: string,
    action: "비공개" | "삭제" | "슬러그 변경",
  ) {
    try {
      await requestDeindexing(slug);
      notify({
        title: `인덱싱 제거 완료 (${action})`,
        icon: "🗑️",
        message: `/posts/${slug}`,
        level: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      notify({
        title: `인덱싱 제거 실패 (${action})`,
        icon: "🗑️",
        message,
        level: "error",
        fields: [{ name: "경로", value: `/posts/${slug}`, inline: false }],
      });
      console.error(`[Google Indexing] 제거 실패 (${action}):`, error);
    }
  }

  switch (type) {
    case "INSERT": {
      if (
        getPostStatus(record) === "published" &&
        record?.slug &&
        !hasTempImages(record)
      ) {
        await indexing(record.slug, "등록");
      }
      break;
    }

    case "UPDATE": {
      const newStatus = getPostStatus(record);
      const oldStatus = getPostStatus(old_record);
      const newSlug = record?.slug;
      const oldSlug = old_record?.slug;
      const oldHadTempImages = hasTempImages(old_record);

      // status, slug, title, content 변경이 없으면 무시 (view_count 등 무관한 필드 변경 제외)
      const significantChange =
        oldStatus !== newStatus ||
        oldSlug !== newSlug ||
        old_record?.title !== record?.title ||
        old_record?.content !== record?.content;

      if (!significantChange) break;

      if (hasTempImages(record)) {
        if (oldStatus === "published" && newStatus !== "published" && oldSlug) {
          await deindexing(oldSlug, "비공개");
        }
        break;
      }

      if (oldStatus === "published" && oldSlug && newSlug && oldSlug !== newSlug) {
        await deindexing(oldSlug, "슬러그 변경");
      }

      if (newStatus === "published" && newSlug) {
        await indexing(
          newSlug,
          oldStatus === "published" && !oldHadTempImages ? "수정" : "등록",
        );
      } else if (oldStatus === "published" && oldSlug) {
        await deindexing(oldSlug, "비공개");
      }
      break;
    }

    case "DELETE": {
      if (getPostStatus(old_record) === "published" && old_record?.slug) {
        await deindexing(old_record.slug, "삭제");
      }
      break;
    }
  }

  return NextResponse.json({ success: true });
}
