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
      "min-[500px]:grid-cols-[repeat(auto-fill,minmax(200px,240px))] min-[500px]:gap-5",
      "md:grid-cols-[repeat(auto-fill,minmax(200px,260px))]",
      "lg:grid-cols-[repeat(auto-fill,minmax(240px,300px))] lg:gap-6",
      "xl:grid-cols-[repeat(auto-fill,minmax(260px,340px))]",
      className,
    )}>
      {children}
    </div>
  );
}
