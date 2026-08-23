"use client";

import { useState } from "react";
import { Wind, Flame, Dumbbell, Timer, PlusCircle } from "lucide-react";
import { WeekDayStrip } from "@/components/ui/WeekDayStrip";
import { MotivationalCard } from "@/components/ui/MotivationalCard";

const BLOCKS = [
  { key: "movilidad", icon: Wind, title: "Movilidad", accent: "lime" as const },
  { key: "calentamiento", icon: Flame, title: "Calentamiento", accent: "orange" as const },
  { key: "fuerza", icon: Dumbbell, title: "Fuerza / Habilidad", accent: "lime" as const },
  { key: "wod", icon: Timer, title: "WOD", accent: "orange" as const },
  { key: "accesorios", icon: PlusCircle, title: "Accesorios", accent: "lime" as const },
];

export function HomeWeekView() {
  const [selected, setSelected] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

  return (
    <div className="mt-6">
      <WeekDayStrip selected={selected} onSelect={setSelected} />

      <div className="mt-4 flex flex-col gap-3 px-5">
        {BLOCKS.map((block) => (
          <MotivationalCard
            key={block.key}
            icon={block.icon}
            eyebrow={block.title}
            title="Sin programar aún"
            subtitle="Tu coach todavía no ha subido esta parte de la sesión"
            accent={block.accent}
          />
        ))}
      </div>
    </div>
  );
}
