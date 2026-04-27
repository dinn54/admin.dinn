const SITEMAP_URL = encodeURIComponent(
  `${process.env.NEXT_PUBLIC_SERVICE_DINN_DEV_DOMAIN}/sitemap.xml`
);

export async function pingSitemaps() {
  await fetch(`https://www.google.com/ping?sitemap=${SITEMAP_URL}`);
  console.log("[Sitemap Ping] Sent to Google");
}
