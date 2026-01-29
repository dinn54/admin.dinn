"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

interface BreadcrumbItemType {
  label: string;
  href: string;
  active: boolean;
}

export function GlobalBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((path) => path);

  // 맵핑 정보 (slug -> friendly name)
  const PATH_MAP: Record<string, string> = {
    dashboard: "대시보드",
    services: "서비스",
    posts: "블로그 글 관리", // posts slug
    reviews: "리뷰 관리", // reviews slug
    dinn_posts: "블로그 글 관리", // table name if used as slug
    dinn_reviews: "리뷰 관리",
  };

  // Logic to generate items based on user requirements
  const generateItems = (): BreadcrumbItemType[] => {
    // Basic root handling
    if (pathname === "/dashboard") {
      return [{ label: "대시보드", href: "/dashboard", active: true }];
    }

    // Services path handling
    if (pathname.startsWith("/services")) {
      const items: BreadcrumbItemType[] = [];
      // Always start with Services
      items.push({
        label: "서비스",
        href: "/services",
        active: pathname === "/services",
      });

      // Handle sub-segments: /services/[name]/[slug]
      // paths[0] is 'services' (already handled)
      // paths[1] is [name]
      // paths[2] is [slug]

      if (paths.length > 1) {
        // [name] segment
        const serviceName = decodeURIComponent(paths[1]);
        const servicePath = `/services/${paths[1]}`;
        items.push({
          label: serviceName,
          href: servicePath,
          active: paths.length === 2,
        });
      }

      if (paths.length > 2) {
        // [slug] segment
        const featureSlug = paths[2];
        const featureLabel =
          PATH_MAP[featureSlug] || decodeURIComponent(featureSlug); // Fallback to decoded slug
        const featurePath = `/services/${paths[1]}/${featureSlug}`;
        items.push({
          label: featureLabel,
          href: featurePath,
          active: paths.length === 3,
        });
      }

      return items;
    }

    // Default fallback
    const items: BreadcrumbItemType[] = [];
    let currentPath = "";
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === paths.length - 1;
      const label = PATH_MAP[segment] || decodeURIComponent(segment);

      items.push({
        label: label,
        href: currentPath,
        active: isLast,
      });
    });
    return items;
  };

  const items = generateItems();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.href + index}>
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {/* First item is often hidden on mobile in original design, enforcing similar behavior if desired, 
                   but user didn't specify. Keeping it simple. 
                   Actually original layout hid first two items on mobile. 
                   Let's assume responsive behavior is desired. */}
              {item.active ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
