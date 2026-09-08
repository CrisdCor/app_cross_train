import { ChevronRight } from "lucide-react";
import { BLOCK_LABELS, type BlockType } from "@/domain/Workout";
import type { BlockForm } from "@/components/wod/programWorkoutTypes";

interface SectionRowProps {
  type: BlockType;
  block: BlockForm;
  onClick: () => void;
}

function summaryText(block: BlockForm): string {
  if (!block.included) return "Sin programar";
  const parts: string[] = [];
  if (block.format.trim()) parts.push(block.format.trim());
  const namedMovements = block.movements.filter((m) => m.name.trim());
  if (namedMovements.length > 0) {
    parts.push(`${namedMovements.length} ejercicio${namedMovements.length === 1 ? "" : "s"}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "Configurado";
}

/** Fila de una sección en la lista de `/wod/programar` — nombre, resumen y flecha que abre el panel lateral de edición. */
export function SectionRow({ type, block, onClick }: SectionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-3 border-b border-border py-4 text-left"
    >
      <span className="flex flex-col gap-1">
        <span className="label-heading text-sm text-text-primary">{BLOCK_LABELS[type]}</span>
        <span className="text-xs text-text-muted">{summaryText(block)}</span>
      </span>
      <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-secondary" />
    </button>
  );
}
