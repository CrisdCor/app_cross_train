"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

export interface WeekDay {
  date: Date;
  isToday: boolean;
}

function getCurrentWeek(reference: Date): WeekDay[] {
  const day = reference.getDay(); // 0 = Sunday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setDate(reference.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const todayKey = new Date(reference).setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { date: d, isToday: d.getTime() === todayKey };
  });
}

export function WeekDayStrip({
  selected,
  onSelect,
  reference = new Date(),
}: {
  selected: number;
  onSelect: (index: number) => void;
  reference?: Date;
}) {
  const week = getCurrentWeek(reference);

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-1">
      {week.map((d, i) => {
        const active = i === selected;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="relative flex w-11 shrink-0 flex-col items-center gap-1.5 py-1"
          >
            {active && (
              <motion.div
                layoutId="week-day-active"
                className="absolute inset-0 rounded-control bg-surface-3"
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span
              className={clsx(
                "relative z-10 pt-2 text-[11px] font-medium",
                active ? "text-text-secondary" : "text-text-muted"
              )}
            >
              {DAY_LABELS[i]}
            </span>
            <span
              className={clsx(
                "relative z-10 pb-2 font-body text-[15px] font-bold",
                active
                  ? "text-accent-lime"
                  : d.isToday
                  ? "text-text-primary"
                  : "text-text-secondary"
              )}
            >
              {d.date.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
