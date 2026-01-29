import { ServiceCard } from "@/components/service/service-card";
import { ServiceGrid } from "@/components/service/service-grid";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { getServices } from "@/lib/data";
import { PageHeader } from "@/components/ui/page-header";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="space-y-6">
      <PageHeader
        title="서비스"
        description="등록된 서비스 제품 및 구성을 관리합니다."
        actions={
          <div className="relative w-full md:w-72">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="서비스 검색..."
              className="pl-9 h-10 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus-visible:ring-primary/20"
            />
          </div>
        }
      />

      <ServiceGrid>
        {services.length > 0 ? (
          services.map((service) => (
            <ServiceCard
              key={service.id}
              {...service}
              description={service.description || ""}
              thumbnail={service.thumbnail || undefined}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">등록된 서비스가 없습니다.</p>
          </div>
        )}
      </ServiceGrid>
    </div>
  );
}
