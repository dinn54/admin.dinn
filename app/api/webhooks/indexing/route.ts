import { NextRequest, NextResponse } from "next/server";
import { requestIndexing, requestDeindexing } from "@/lib/google-indexing";
import { pingSitemaps } from "@/lib/sitemap-ping";

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

  try {
    switch (type) {
      case "INSERT": {
        if (record?.status === "published" && record.slug) {
          await Promise.all([
            requestIndexing(record.slug),
            pingSitemaps(),
          ]);
        }
        break;
      }

      case "UPDATE": {
        const newStatus = record?.status;
        const oldStatus = old_record?.status;
        const slug = record?.slug || old_record?.slug;

        if (!slug) break;

        if (newStatus === "published") {
          await Promise.all([
            requestIndexing(slug),
            pingSitemaps(),
          ]);
        } else if (oldStatus === "published" && newStatus !== "published") {
          await requestDeindexing(slug);
        }
        break;
      }

      case "DELETE": {
        if (old_record?.status === "published" && old_record.slug) {
          await requestDeindexing(old_record.slug);
        }
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Webhook Indexing] Error:", error);
    return NextResponse.json(
      { error: "Indexing request failed" },
      { status: 500 }
    );
  }
}
