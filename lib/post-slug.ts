export function createPostSlug(title: string) {
  const slug = title
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "post";
}
