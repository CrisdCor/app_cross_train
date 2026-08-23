import { clsx } from "clsx";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-card border border-border bg-surface-1 p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
