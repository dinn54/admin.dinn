const DINN_DEV_URL = process.env.NEXT_PUBLIC_SERVICE_DINN_DEV_DOMAIN!;
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET!;

interface RevalidateRecord {
  slug: string;
  is_visible?: boolean;
}

interface RevalidatePayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  record?: RevalidateRecord;
  old_record?: RevalidateRecord;
}

export async function revalidateDinnDev(payload: RevalidatePayload) {
  if (!REVALIDATE_SECRET || !DINN_DEV_URL) return;
  try {
    const res = await fetch(`${DINN_DEV_URL}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": REVALIDATE_SECRET,
      },
      body: JSON.stringify(payload),
    });
    console.log(`[dinn.dev revalidate] ${payload.type}:`, res.status);
  } catch (err) {
    console.error("[dinn.dev revalidate] Failed:", err);
  }
}
