"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { HistoryBackButton } from "@/components/ui/history-back-button";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: React.ReactNode;
  showBackButton?: boolean;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  showBackButton = false,
  actions,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b pb-6",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        {showBackButton && (
          <div className="flex items-center gap-4 pt-1">
            <HistoryBackButton className="h-8 w-8" />
            <Separator orientation="vertical" className="h-6 hidden md:block" />
          </div>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {children}
          </div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
