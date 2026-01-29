import { notFound } from "next/navigation";
import PostEditorView from "@/components/service/post-editor-view";
import { getServiceByName, getServiceFeatureBySlug } from "@/lib/data";

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ name: string; slug: string }>;
}) {
  const { name, slug } = await params;
  const decodedName = decodeURIComponent(name);

  // 1. Get Service ID
  const service = await getServiceByName(decodedName);
  if (!service) return notFound();

  // 2. Get Feature Details
  const feature = await getServiceFeatureBySlug(service.id, slug);
  if (!feature) return notFound();

  const returnUrl = `/services/${encodeURIComponent(name)}/${slug}`;

  return (
    <PostEditorView
      serviceId={service.id}
      featureId={feature.id}
      returnUrl={returnUrl}
    />
  );
}
