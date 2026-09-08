"use client";

import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { maxProgramDate } from "@/lib/dates";

interface DateJumpPickerProps {
  selectedDate: string;
  basePath: string;
}

/**
 * Selector de fecha exacta para que el Head Coach pueda saltar a cualquier
 * día dentro del rango programable (hasta un mes por delante) sin tener
 * que navegar semana por semana con el semanario.
 */
export function DateJumpPicker({ selectedDate, basePath }: DateJumpPickerProps) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 px-5 pb-4 text-text-secondary">
      <CalendarDays size={16} strokeWidth={1.5} />
      <input
        type="date"
        value={selectedDate}
        max={maxProgramDate()}
        onChange={(e) => {
          if (e.target.value) router.push(`${basePath}?date=${e.target.value}`);
        }}
        className="border-0 bg-transparent p-0 text-sm text-text-primary outline-none"
        aria-label="Ir a una fecha específica"
      />
    </label>
  );
}
