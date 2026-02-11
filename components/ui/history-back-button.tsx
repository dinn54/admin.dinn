"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useRouter } from "@bprogress/next";

interface HistoryBackButtonProps {
  className?: string;
  href?: string;
}

export function HistoryBackButton({ className, href }: HistoryBackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => (href ? router.push(href) : router.back())}
      className={cn(
        "h-10 w-10 hover:bg-transparent hover:text-primary transition-colors",
        className
      )}
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} className="h-6 w-6" />
    </Button>
  );
}
