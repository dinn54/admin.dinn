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

type PostStatus = "draft" | "unlisted" | "published";
type IndexingUpdateReason = "글 등록" | "글 수정" | "글 출간";
type IndexingDeleteReason = "글 비공개" | "글 삭제" | "슬러그 변경";

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
  ): PostStatus | null => {
    if (!value) return null;
    if (value.is_visible) return "published";
    if (value.published_at) return "unlisted";
    return "draft";
  };
  const hasTempImages = (value: WebhookRecord | null) =>
    typeof value?.content === "string" && value.content.includes("/posts/temp/");

  async function indexing(slug: string, reason: IndexingUpdateReason) {
    try {
      await Promise.all([requestIndexing(slug), pingSitemaps()]);
      notify({
        title: `인덱싱 ${getIndexingActionLabel(reason)} 요청 완료`,
        icon: "🔎",
        message: getPostPath(slug),
        level: "success",
        fields: [
          { name: "요청 타입", value: "URL_UPDATED", inline: true },
          { name: "원인", value: reason, inline: true },
          { name: "경로", value: getPostPath(slug), inline: false },
          { name: "Sitemap", value: "ping 완료", inline: true },
        ],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      notify({
        title: `인덱싱 ${getIndexingActionLabel(reason)} 요청 실패`,
        icon: "🔎",
        message: getPostPath(slug),
        level: "error",
        fields: [
          { name: "요청 타입", value: "URL_UPDATED", inline: true },
          { name: "원인", value: reason, inline: true },
          { name: "경로", value: getPostPath(slug), inline: false },
          { name: "오류", value: message, inline: false },
        ],
      });
      console.error(`[Google Indexing] 실패 (${reason}):`, error);
    }
  }

  async function deindexing(
    slug: string,
    reason: IndexingDeleteReason,
  ) {
    try {
      await requestDeindexing(slug);
      notify({
        title: `인덱싱 삭제 요청 완료`,
        icon: "🧹",
        message: getPostPath(slug),
        level: "success",
        fields: [
          { name: "요청 타입", value: "URL_DELETED", inline: true },
          { name: "원인", value: reason, inline: true },
          { name: "경로", value: getPostPath(slug), inline: false },
        ],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      notify({
        title: `인덱싱 삭제 요청 실패`,
        icon: "🧹",
        message: getPostPath(slug),
        level: "error",
        fields: [
          { name: "요청 타입", value: "URL_DELETED", inline: true },
          { name: "원인", value: reason, inline: true },
          { name: "경로", value: getPostPath(slug), inline: false },
          { name: "오류", value: message, inline: false },
        ],
      });
      console.error(`[Google Indexing] 제거 실패 (${reason}):`, error);
    }
  }

  switch (type) {
    case "INSERT": {
      if (
        getPostStatus(record) === "published" &&
        record?.slug &&
        !hasTempImages(record)
      ) {
        await indexing(record.slug, "글 등록");
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
          await deindexing(oldSlug, "글 비공개");
        }
        break;
      }

      if (oldStatus === "published" && oldSlug && newSlug && oldSlug !== newSlug) {
        await deindexing(oldSlug, "슬러그 변경");
      }

      if (newStatus === "published" && newSlug) {
        await indexing(
          newSlug,
          getUpdateIndexingReason(oldStatus, oldHadTempImages),
        );
      } else if (oldStatus === "published" && oldSlug) {
        await deindexing(oldSlug, "글 비공개");
      }
      break;
    }

    case "DELETE": {
      if (getPostStatus(old_record) === "published" && old_record?.slug) {
        await deindexing(old_record.slug, "글 삭제");
      }
      break;
    }
  }

  return NextResponse.json({ success: true });
}

function getPostPath(slug: string) {
  return `/posts/${slug}`;
}

function getUpdateIndexingReason(
  oldStatus: PostStatus | null,
  oldHadTempImages: boolean,
): IndexingUpdateReason {
  if (oldStatus === "published" && !oldHadTempImages) return "글 수정";
  return "글 출간";
}

function getIndexingActionLabel(reason: IndexingUpdateReason) {
  if (reason === "글 등록") return "등록";
  if (reason === "글 수정") return "수정";
  return "출간";
}
