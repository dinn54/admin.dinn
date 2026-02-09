import { GoogleAuth } from "google-auth-library";

const INDEXING_API_URL =
  "https://indexing.googleapis.com/v3/urlNotifications:publish";

const SITE_BASE_URL = process.env.NEXT_PUBLIC_SERVICE_DINN_DEV_DOMAIN

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n"
    ),
  },
  scopes: ["https://www.googleapis.com/auth/indexing"],
});

async function notifyGoogle(url: string, type: "URL_UPDATED" | "URL_DELETED") {
  const client = await auth.getClient();
  const response = await client.request({
    url: INDEXING_API_URL,
    method: "POST",
    data: { url, type },
  });
  console.log(`[Google Indexing] ${type} ${url}:`, response.status);
  return response;
}

export function buildPostUrl(slug: string) {
  return `${SITE_BASE_URL}/posts/${slug}`;
}

export async function requestIndexing(slug: string) {
  const url = buildPostUrl(slug);
  return notifyGoogle(url, "URL_UPDATED");
}

export async function requestDeindexing(slug: string) {
  const url = buildPostUrl(slug);
  return notifyGoogle(url, "URL_DELETED");
}
