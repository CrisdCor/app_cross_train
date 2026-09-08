"use client";

import { clsx } from "clsx";
import { ChevronLeft, Plus } from "lucide-react";
import { SECTION_LABELS, type SectionType } from "@/domain/Workout";
import { emptyWorkBlock, type WorkBlockForm } from "@/components/wod/programWorkoutTypes";
import { WorkBlockEditor } from "@/components/wod/WorkBlockEditor";
import { buttonClassName } from "@/components/ui/Button";

interface BlockEditorPanelProps {
  mounted: boolean;
  visible: boolean;
  sectionType: SectionType | null;
  blocks: WorkBlockForm[];
  onClose: () => void;
  onChangeBlocks: (blocks: WorkBlockForm[]) => void;
}

/**
 * Panel "tipo cuaderno" que se desliza desde la derecha con todos los
 * bloques de trabajo de una sección (ej. "WOD A", "WOD B") — se abre al
 * tocar una fila de `SectionRow` en `/wod/programar`. Cada bloque se edita
 * con `WorkBlockEditor`; este panel solo orquesta agregar/quitar/editar
 * bloques dentro de la sección activa.
 */
export function BlockEditorPanel({
  mounted,
  visible,
  sectionType,
  blocks,
  onClose,
  onChangeBlocks,
}: BlockEditorPanelProps) {
  if (!mounted || !sectionType) return null;

  function updateBlock(key: string, updated: WorkBlockForm) {
    onChangeBlocks(blocks.map((b) => (b.key === key ? updated : b)));
  }

  function removeBlock(key: string) {
    onChangeBlocks(blocks.filter((b) => b.key !== key));
  }

  function addBlock() {
    onChangeBlocks([...blocks, emptyWorkBlock()]);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className={clsx(
          "absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />
      <div
        className={clsx(
          "relative z-10 flex h-full w-full max-w-[480px] flex-col overflow-y-auto bg-white",
          "transition-transform duration-300 ease-out",
          visible ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <button type="button" onClick={onClose} aria-label="Volver">
            <ChevronLeft size={22} strokeWidth={1.5} className="text-text-primary" />
          </button>
          <p className="label-heading text-sm text-text-primary">{SECTION_LABELS[sectionType]}</p>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {blocks.map((block, index) => (
            <WorkBlockEditor
              key={block.key}
              block={block}
              index={index}
              onChange={(updated) => updateBlock(block.key, updated)}
              onRemove={() => removeBlock(block.key)}
            />
          ))}

          <button type="button" onClick={addBlock} className={buttonClassName("outline")}>
            Agregar bloque de trabajo
            <Plus size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
