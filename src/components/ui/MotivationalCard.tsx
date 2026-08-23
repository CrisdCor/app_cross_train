import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { Card } from "./Card";

const ACCENT_CLASSES = {
  neutral: { bg: "bg-surface-3", icon: "text-text-secondary" },
  lime: { bg: "bg-accent-lime/15", icon: "text-accent-lime" },
  orange: { bg: "bg-accent-orange/15", icon: "text-accent-orange" },
};

export function MotivationalCard({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  accent = "neutral",
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: "neutral" | "lime" | "orange";
}) {
  const accentClasses = ACCENT_CLASSES[accent];

  return (
    <Card className="flex items-center gap-4">
      <div
        className={clsx(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          accentClasses.bg
        )}
      >
        <Icon size={22} className={accentClasses.icon} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {eyebrow}
        </p>
        <p className="truncate font-body text-base font-bold text-text-primary">
          {title}
        </p>
        <p className="truncate text-sm text-text-secondary">{subtitle}</p>
      </div>
    </Card>
  );
}
