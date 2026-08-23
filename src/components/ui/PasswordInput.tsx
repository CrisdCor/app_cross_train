"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { clsx } from "clsx";

export function PasswordInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={clsx(
          "h-14 w-full rounded-control border border-border bg-surface-2 pl-4 pr-12 text-[15px] text-text-primary placeholder:text-text-muted",
          "outline-none transition-colors focus:border-text-secondary",
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-0 top-0 flex h-14 w-12 items-center justify-center text-text-muted"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
