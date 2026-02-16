import { TextareaHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-slate-500 focus:border-tide",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
