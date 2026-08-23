"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-control border border-border bg-surface-2 p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="relative flex-1 rounded-[calc(var(--radius-control)-4px)] py-2 text-sm font-semibold"
          >
            {active && (
              <motion.div
                layoutId="segmented-active"
                className="absolute inset-0 rounded-[calc(var(--radius-control)-4px)] bg-surface-3"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span
              className={clsx(
                "relative z-10",
                active ? "text-text-primary" : "text-text-secondary"
              )}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
