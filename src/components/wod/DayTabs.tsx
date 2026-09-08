import Link from "next/link";
import { clsx } from "clsx";
import { weekOf } from "@/lib/dates";

interface DayTabsProps {
  selectedDate: string;
  basePath: string;
}

/** Semanario: Lun–Dom con el número del día debajo (ej. Mar / 08). */
export function DayTabs({ selectedDate, basePath }: DayTabsProps) {
  const days = weekOf(selectedDate);

  return (
    <div className="flex items-center justify-between gap-1 px-5 pb-4">
      {days.map(({ iso, label, dayNumber }) => {
        const active = iso === selectedDate;
        return (
          <Link
            key={iso}
            href={`${basePath}?date=${iso}`}
            aria-current={active ? "date" : undefined}
            className={clsx(
              "flex flex-1 flex-col items-center gap-1 py-2 transition-colors",
              active ? "bg-black text-white" : "text-text-secondary"
            )}
          >
            <span className="label-heading text-[10px]">{label}</span>
            <span className="text-base font-bold">{dayNumber}</span>
          </Link>
        );
      })}
    </div>
  );
}
