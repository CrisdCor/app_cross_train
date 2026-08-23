import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { Card } from "./Card";

export function MotivationalCard({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  accent = "lime",
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: "lime" | "orange";
}) {
  return (
    <Card className="flex items-center gap-4">
      <div
        className={clsx(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          accent === "lime" ? "bg-accent-lime/15" : "bg-accent-orange/15"
        )}
      >
        <Icon
          size={22}
          className={accent === "lime" ? "text-accent-lime" : "text-accent-orange"}
        />
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
