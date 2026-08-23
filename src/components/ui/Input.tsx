import { clsx } from "clsx";
import { forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          "h-[42px] w-full rounded-control border border-border bg-surface-2 px-4 text-[15px] text-text-primary placeholder:text-text-muted",
          "outline-none transition-colors focus:border-text-secondary",
          className
        )}
        {...props}
      />
    );
  }
);
