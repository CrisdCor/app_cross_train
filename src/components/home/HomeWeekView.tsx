"use client";

import { useState } from "react";
import { Wind, Flame, Dumbbell, Timer, PlusCircle } from "lucide-react";
import { WeekDayStrip } from "@/components/ui/WeekDayStrip";
import { MotivationalCard } from "@/components/ui/MotivationalCard";

const BLOCKS = [
  { key: "movilidad", icon: Wind, title: "Movilidad" },
  { key: "calentamiento", icon: Flame, title: "Calentamiento" },
  { key: "fuerza", icon: Dumbbell, title: "Fuerza / Habilidad" },
  { key: "wod", icon: Timer, title: "WOD" },
  { key: "accesorios", icon: PlusCircle, title: "Accesorios" },
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
          />
        ))}
      </div>
    </div>
  );
}
