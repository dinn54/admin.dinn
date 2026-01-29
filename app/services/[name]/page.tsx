import { ServiceManagementDashboard } from "@/components/service/service-management-dashboard";
import {
  getServiceFeatures,
  getServiceById,
  getServiceByName,
} from "@/lib/data";
import { notFound } from "next/navigation";

export default async function ServiceManagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ id?: string; active?: string }>;
}) {
  const { name } = await params;
  const { id: queryId, active: queryActive } = await searchParams;
  // Case 1: ID provided in query params (Optimization)
  if (queryId) {
    const serviceName = decodeURIComponent(name);
    const features = await getServiceFeatures(queryId);

    return (
      <ServiceManagementDashboard
        serviceName={serviceName}
        serviceId={queryId}
        isConfigured={queryActive === "true"}
        features={features}
      />
    );
  }

  // Case 2: No ID provided, fetch by Name (Direct access / shared link)
  const decodedName = decodeURIComponent(name);
  const service = await getServiceByName(decodedName);

  if (!service) {
    notFound();
  }

  const features = await getServiceFeatures(service.id);

  return (
    <ServiceManagementDashboard
      serviceName={service.name}
      serviceId={service.id}
      isConfigured={service.status === "Active"}
      features={features}
    />
  );
}
