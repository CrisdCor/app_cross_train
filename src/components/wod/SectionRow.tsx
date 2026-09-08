import { ChevronRight } from "lucide-react";
import { SECTION_LABELS, type SectionType } from "@/domain/Workout";
import type { WorkBlockForm } from "@/components/wod/programWorkoutTypes";

interface SectionRowProps {
  type: SectionType;
  blocks: WorkBlockForm[];
  onClick: () => void;
}

function summaryText(blocks: WorkBlockForm[]): string {
  if (blocks.length === 0) return "Sin programar";
  const exerciseCount = blocks.reduce(
    (total, b) => total + b.exercises.filter((e) => e.name.trim()).length,
    0
  );
  const blockLabel = blocks.length === 1 ? "1 bloque" : `${blocks.length} bloques`;
  return exerciseCount > 0
    ? `${blockLabel} · ${exerciseCount} ejercicio${exerciseCount === 1 ? "" : "s"}`
    : blockLabel;
}

/** Fila de una sección en la lista de `/wod/programar` — nombre, resumen y flecha que abre el panel lateral de edición. */
export function SectionRow({ type, blocks, onClick }: SectionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 border-b border-border py-4 text-left"
    >
      <span className="flex flex-col gap-1">
        <span className="label-heading text-sm text-text-primary">{SECTION_LABELS[type]}</span>
        <span className="text-xs text-text-muted">{summaryText(blocks)}</span>
      </span>
      <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-secondary" />
    </button>
  );
}
