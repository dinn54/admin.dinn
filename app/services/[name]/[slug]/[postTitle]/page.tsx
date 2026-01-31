import { notFound } from "next/navigation";
import {
  fetchRowByColumn,
  getServiceFeatureBySlug,
  getServiceByName,
  fetchAdjacentRows,
} from "@/lib/data";
import { PostDetailView } from "@/components/service/post-detail-view";
import { estimateReadTimeMinutes } from "@/lib/utils";
import ServerLexicalRenderer from "@/components/editor/ui/ServerLexicalRenderer";
import { parseMarkdownToLexicalNodes } from "@/lib/parseMarkdownServer";

import { LexicalNode } from "@/lib/parseMarkdownServer";

export interface Post {
  id: string;
  title: string;
  description: string;
  date: string;
  updatedDate: string;
  tags: string[];
  imageUrl: string;
  readTimeMinutes: number;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  contentNodes?: LexicalNode[];
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ name: string; slug: string; postTitle: string }>;
}) {
  const { name, slug, postTitle } = await params;
  const decodedName = decodeURIComponent(name);
  const decodedTitle = decodeURIComponent(postTitle);

  // 1. Get Service
  const service = await getServiceByName(decodedName);
  if (!service) return notFound();

  // 2. Get Feature
  const feature = await getServiceFeatureBySlug(service.id, slug);
  if (!feature) return notFound();

  // 3. Get Post Data
  const rawPost = await fetchRowByColumn(
    feature.table_name,
    "title",
    decodedTitle
  );

  if (!rawPost) return notFound();

  // 서버에서 마크다운 파싱
  const contentNodes = rawPost.content
    ? parseMarkdownToLexicalNodes(rawPost.content)
    : [];

  const post: Post = {
    id: rawPost.id,
    title: rawPost.title,
    description: rawPost.description || "",
    date: rawPost.created_at
      ? new Date(rawPost.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    updatedDate: rawPost.updated_at
      ? new Date(rawPost.updated_at).toISOString().split("T")[0]
      : "",
    tags: rawPost.tags || [],
    imageUrl: "", // Add default or real image URL if available in rawPost
    readTimeMinutes:
      typeof rawPost.read_time === "number"
        ? rawPost.read_time
        : estimateReadTimeMinutes(rawPost.content),
    author: {
      name: rawPost.author_name || "Admin",
      role: rawPost.author_role || "Administrator",
      avatar: rawPost.author_avatar || "",
    },
    content: rawPost.content || "",
    contentNodes,
  };

  const { prev, next } = await fetchAdjacentRows(feature.table_name, post.id);
  const basePath = `/services/${decodedName}/${slug}`;

  // Helper to cast types if needed for compatibility
  const safePrev = prev as any;
  const safeNext = next as any;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <PostDetailView post={post}>
        {contentNodes.length > 0 ? (
          <ServerLexicalRenderer nodes={contentNodes} />
        ) : (
          <div className="py-20 text-center text-slate-500">
            <p>콘텐츠를 불러올 수 없습니다.</p>
          </div>
        )}
      </PostDetailView>
    </div>
  );
}
