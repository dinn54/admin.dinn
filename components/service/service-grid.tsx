import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ServiceGridProps {
  children: ReactNode;
  className?: string;
}

export function ServiceGrid({ children, className }: ServiceGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-4",
      "sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-5",
      "md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]",
      "lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] lg:gap-6",
      "xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]",
      className,
    )}>
      {children}
    </div>
  );
}
