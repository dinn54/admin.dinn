"use client";

import {
  DashboardCircleIcon,
  ShoppingBasket01Icon,
  Settings02Icon,
  Logout03Icon,
} from "@hugeicons/core-free-icons";

import { HugeiconsIcon } from "@hugeicons/react";
import { signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const items = [
  {
    title: "대시보드",
    url: "/dashboard",
    icon: DashboardCircleIcon,
  },
  {
    title: "서비스",
    url: "/services",
    icon: ShoppingBasket01Icon,
  },
  {
    title: "설정",
    url: "/settings",
    icon: Settings02Icon,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-4 border-b justify-center">
        <div className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground relative">
            <Image src={'https://mowzqxruruhcvjgpzzdb.supabase.co/storage/v1/object/public/dinn_dev/logo_dinn.png'} alt="Logo" width={32} height={32} className="rounded-lg" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden text-xl tracking-tight whitespace-nowrap overflow-hidden">
            Admin Dinn
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>애플리케이션</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname.startsWith(item.url)}
                    tooltip={item.title}
                  >
                    <HugeiconsIcon icon={item.icon} size={20} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              tooltip="로그아웃"
            >
              <HugeiconsIcon icon={Logout03Icon} size={20} />
              <span>로그아웃</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
