"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  News01Icon,
  Message01Icon,
  Settings02Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import { HistoryBackButton } from "@/components/ui/history-back-button";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/lib/database.types";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Helper for icon mapping
const getIcon = (iconName: string | null) => {
  switch (iconName) {
    case "News01Icon":
      return News01Icon;
    case "Message01Icon":
      return Message01Icon;
    default:
      return HelpCircleIcon;
  }
};

type ServiceFeature = Database["public"]["Tables"]["service_features"]["Row"];

interface ServiceManagementdashboardProps {
  serviceName: string;
  serviceId: string;
  isConfigured: boolean;
  features: ServiceFeature[];
}

export function ServiceManagementDashboard({
  serviceName,
  serviceId,
  isConfigured,
  features,
}: ServiceManagementdashboardProps) {
  return (
    <div className="space-y-8 ">
      <div className="flex flex-col gap-4">
        <PageHeader
          title={serviceName}
          description={`ID: ${serviceId}`}
          showBackButton={true}
          backHref="/services"
          actions={
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <HugeiconsIcon icon={Settings02Icon} size={16} />
              설정
            </Button>
          }
        >
          <Badge
            variant={isConfigured ? "default" : "secondary"}
            className="text-xs font-normal px-2.5 py-0.5 ml-2"
          >
            {isConfigured ? "운영 중" : "비활성"}
          </Badge>
        </PageHeader>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in zoom-in-95 duration-300">
        {features.map((feature) => {
          const Icon = getIcon(feature.icon);
          // Construct path: /services/[serviceName]/[featurePath]
          // Remove leading slash from feature.path if present to avoid double slash
          const cleanPath = feature.path.startsWith("/")
            ? feature.path.slice(1)
            : feature.path;
          const href = `/services/${encodeURIComponent(
            serviceName
          )}/${cleanPath}`;

          return (
            <Link key={feature.id} href={href} className="block group">
              <Card
                className={cn(
                  "h-full cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border hover:border-primary/50 overflow-hidden relative"
                )}
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity -rotate-12">
                  <HugeiconsIcon icon={Icon} size={120} />
                </div>
                <CardHeader className="space-y-4 pb-2">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:rotate-3 transition-all duration-300 shadow-sm">
                    <HugeiconsIcon
                      icon={Icon}
                      size={24}
                      className="text-primary group-hover:text-primary-foreground transition-colors"
                    />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {feature.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.name} 기능을 관리합니다.
                    <br />
                    <span className="text-xs opacity-70 mt-2 block">
                      Table: {feature.table_name}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {features.length === 0 && (
          <div className="col-span-full py-12 text-center border dashed border-border rounded-lg">
            <p className="text-muted-foreground">
              활성화된 관리 기능이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
