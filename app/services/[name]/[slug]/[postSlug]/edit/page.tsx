import { notFound } from "next/navigation";
import PostEditorView, { type PostData } from "@/components/service/post-editor-view";
import {
  fetchRowByColumn,
  getServiceByName,
  getServiceFeatureBySlug,
} from "@/lib/data";
import { estimateReadTimeMinutes } from "@/lib/utils";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ name: string; slug: string; postSlug: string }>;
}) {
  const { name, slug, postSlug } = await params;
  const decodedName = decodeURIComponent(name);
  const decodedPostSlug = decodeURIComponent(postSlug);

  // 1. Get Service
  const service = await getServiceByName(decodedName);
  if (!service) return notFound();

  // 2. Get Feature
  const feature = await getServiceFeatureBySlug(service.id, slug);
  if (!feature) return notFound();

  // 3. Get Post Data
  const rawPost = await fetchRowByColumn(
    feature.table_name,
    "slug",
    decodedPostSlug
  );

  if (!rawPost) return notFound();

  // Determine status from is_visible and published_at
  const getStatus = () => {
    if (rawPost.is_visible) return "published";
    if (rawPost.published_at) return "unlisted";
    return "draft";
  };

  // Map DB data to PostData format
  const postData: PostData = {
    id: rawPost.id,
    title: rawPost.title,
    subtitle: rawPost.description || "",
    tags: rawPost.tags || [],
    readTime:
      typeof rawPost.read_time === "number"
        ? rawPost.read_time
        : estimateReadTimeMinutes(rawPost.content),
    content: rawPost.content || "",
    status: getStatus() as PostData["status"],
    author: {
      name: rawPost.author_name || "Admin",
      role: rawPost.author_role || "Administrator",
      avatar: rawPost.author_avatar || "",
    },
    createdAt: rawPost.created_at
      ? new Date(rawPost.created_at).toISOString().split("T")[0]
      : "",
    updatedAt: rawPost.updated_at
      ? new Date(rawPost.updated_at).toISOString().split("T")[0]
      : "",
    likes: rawPost.like_count || 0,
  };

  const returnUrl = `/services/${encodeURIComponent(name)}/${slug}`;

  return (
    <PostEditorView
      serviceId={service.id}
      featureId={feature.id}
      initialData={postData}
      mode="edit"
      returnUrl={returnUrl}
    />
  );
}
