"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string; icon?: React.ReactNode }[];
  className?: string;
}

export function Tabs({ value, onValueChange, items, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto rounded-xl bg-muted p-1", className)} role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onValueChange(item.value)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === item.value
              ? "bg-white text-foreground card-shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
