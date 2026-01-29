
import React from 'react';
import { cn } from "@/lib/utils";

interface BlockEmbedMainProps {
    children: React.ReactNode;
    className?: string;
}

export function BlockEmbedMain({ children, className }: BlockEmbedMainProps) {
    return (
        <div className={cn("relative my-4 select-none", className)}>
            {children}
        </div>
    );
}
