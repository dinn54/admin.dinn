"use client";

import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { GlobalBreadcrumb } from "@/components/global-breadcrumb";

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Login page - no sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Authenticated pages - with sidebar
  return (
    <SidebarProvider className="lg:min-h-[800px]">
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 bg-background flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <GlobalBreadcrumb />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-4 lg:p-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
