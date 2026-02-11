import { SummaryCard } from "@/components/service/summary-card";
import { ServiceCard } from "@/components/service/service-card";
import { ServiceGrid } from "@/components/service/service-grid";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Time02Icon } from "@hugeicons/core-free-icons";
import { getServices, getRecentActivities, getSummaryStats } from "@/lib/data";

export default async function DashboardPage() {
  const [summaryData, featuredServices, recentActivities] = await Promise.all([
    getSummaryStats(),
    getServices(),
    getRecentActivities(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">
          시스템 상태에 대한 일반적인 개요입니다.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 xl:grid-cols-4">
        {/* Left Main Content */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))] sm:gap-3 md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] md:gap-4 lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] xl:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] xl:gap-5">
            {summaryData.map((data) => (
              <SummaryCard key={data.title} {...data} />
            ))}
          </div>

          {/* Featured Services */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">주요 서비스</h2>
            <ServiceGrid>
              {featuredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  {...service}
                  description={service.description || ""}
                  thumbnail={service.thumbnail || undefined}
                />
              ))}
            </ServiceGrid>
          </div>
        </div>

        {/* Right Sidebar - Recent Activity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">최근 활동</h2>
            <Badge variant="outline" className="text-[10px] h-5">
              실시간
            </Badge>
          </div>
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>활동</TableHead>
                  <TableHead className="text-right">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{activity.action}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {activity.target}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <HugeiconsIcon icon={Time02Icon} size={10} />
                            {activity.timestamp}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top py-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {activity.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-24 text-center text-muted-foreground"
                    >
                      최근 활동이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
