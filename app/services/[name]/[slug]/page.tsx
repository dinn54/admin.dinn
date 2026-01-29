import { notFound } from "next/navigation";
import { FeaturePostManagement } from "@/components/service/feature-post-management";
import { FeatureReviewManagement } from "@/components/service/feature-review-management";
import { Badge } from "@/components/ui/badge";
import {
  getServiceByName,
  getServiceFeatureBySlug,
  fetchTableData,
} from "@/lib/data";
import { estimateReadTimeMinutes } from "@/lib/utils";

import { PageHeader } from "@/components/ui/page-header";

export default async function ServiceFeaturePage({
  params,
}: {
  params: Promise<{ name: string; slug: string }>;
}) {
  const { name, slug } = await params;
  const decodedName = decodeURIComponent(name);

  // 1. Get Service ID
  const service = await getServiceByName(decodedName);
  if (!service) return notFound();

  // 2. Get Feature Details (to know table name)
  const feature = await getServiceFeatureBySlug(service.id, slug);
  if (!feature) return notFound();

  // 3. Fetch Data from Dynamic Table
  const rawData = await fetchTableData(feature.table_name);
  let FeatureComponent;
  let componentProps = {};

  // Helper to determine status from is_visible and published_at
  const getStatus = (item: any) => {
    if (item.is_visible) return "published";
    if (item.published_at) return "unlisted";
    return "draft";
  };

  // Simple mapping based on slug or table_name
  if (feature.table_name === "dinn_posts" || slug === "posts") {
    FeatureComponent = FeaturePostManagement;
    // Map DB snake_case to Frontend camelCase for BlogPost
    const formattedPosts = rawData.map((item: any) => ({
      id: item.id,
      title: item.title,
      subtitle: item.description || "",
      tags: item.tags || [],
      readTime:
        typeof item.read_time === "number"
          ? item.read_time
          : estimateReadTimeMinutes(item.content),
      content: item.content,
      status: getStatus(item),
      author: {
        name: item.author_name || "Admin",
        role: item.author_role || "Administrator",
        avatar: item.author_avatar || "",
      },
      updatedAt: item.updated_at
        ? new Date(item.updated_at).toISOString().split("T")[0]
        : "",
      createdAt: item.created_at
        ? new Date(item.created_at).toISOString().split("T")[0]
        : "",
      likes: item.like_count || 0,
    }));
    componentProps = { initialData: formattedPosts };
  } else if (
    ["reviews", "dinn_reviews", "user_reviews"].includes(slug) ||
    feature.table_name.includes("review")
  ) {
    FeatureComponent = FeatureReviewManagement;
    componentProps = { initialData: rawData };
  } else {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={service.name}
        description={`ID: ${feature.id}`}
        showBackButton={true}
      >
        <Badge
          variant="outline"
          className="text-xs font-normal px-2.5 py-0.5 ml-2"
        >
          {feature.name}
        </Badge>
      </PageHeader>

      <div className="rounded-lg p-6 bg-card">
        <FeatureComponent {...componentProps} />
      </div>
    </div>
  );
}
