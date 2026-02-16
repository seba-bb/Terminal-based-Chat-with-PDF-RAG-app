import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-slate-900/15 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-slate-500 focus:border-tide",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
