import { NextRequest, NextResponse } from "next/server";
import { requestIndexing, requestDeindexing } from "@/lib/google-indexing";
import { pingSitemaps } from "@/lib/sitemap-ping";
import { notifySlack } from "@/lib/slack";

interface WebhookRecord {
  slug?: string;
  status?: string;
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

  async function indexing(slug: string, action: "등록" | "수정") {
    try {
      await Promise.all([requestIndexing(slug), pingSitemaps()]);
      notifySlack(`인덱싱 요청 완료 (${action}): /posts/${slug}`, action === "등록" ? "green" : "yellow");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      notifySlack(`인덱싱 요청 실패 (${action}): /posts/${slug}\n${message}`, "red");
      console.error(`[Google Indexing] 실패 (${action}):`, error);
    }
  }

  async function deindexing(slug: string, action: "비공개" | "삭제") {
    try {
      await requestDeindexing(slug);
      notifySlack(`인덱싱 제거 완료 (${action}): /posts/${slug}`, "red");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      notifySlack(`인덱싱 제거 실패 (${action}): /posts/${slug}\n${message}`, "red");
      console.error(`[Google Indexing] 제거 실패 (${action}):`, error);
    }
  }

  switch (type) {
    case "INSERT": {
      if (record?.status === "published" && record.slug) {
        await indexing(record.slug, "등록");
      }
      break;
    }

    case "UPDATE": {
      const newStatus = record?.status;
      const oldStatus = old_record?.status;
      const slug = record?.slug || old_record?.slug;

      if (!slug) break;

      if (newStatus === "published") {
        await indexing(slug, "수정");
      } else if (oldStatus === "published" && newStatus !== "published") {
        await deindexing(slug, "비공개");
      }
      break;
    }

    case "DELETE": {
      if (old_record?.status === "published" && old_record.slug) {
        await deindexing(old_record.slug, "삭제");
      }
      break;
    }
  }

  return NextResponse.json({ success: true });
}
