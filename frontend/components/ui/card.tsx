import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-900/10 bg-white/90 p-6 shadow-card backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}
