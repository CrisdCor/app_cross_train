"use client";

import { clsx } from "clsx";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { BLOCK_FORMAT_HINTS, BLOCK_LABELS, type BlockType } from "@/domain/Workout";
import { Input } from "@/components/ui/Input";
import { buttonClassName } from "@/components/ui/Button";
import type { BlockForm, CategoryForm, MovementForm } from "@/components/wod/programWorkoutTypes";

interface BlockEditorPanelProps {
  mounted: boolean;
  visible: boolean;
  type: BlockType | null;
  block: BlockForm | null;
  onClose: () => void;
  onToggle: (included: boolean) => void;
  onChange: (patch: Partial<BlockForm>) => void;
  onMovementChange: (index: number, patch: Partial<MovementForm>) => void;
  onAddMovement: () => void;
  onRemoveMovement: (index: number) => void;
  onCategoryChange?: (index: number, patch: Partial<CategoryForm>) => void;
  onAddCategory?: () => void;
  onRemoveCategory?: (index: number) => void;
}

/**
 * Panel "tipo cuaderno" que se desliza desde la derecha con el detalle de
 * una sola sección de la programación (crear/editar) — se abre al tocar
 * una fila de `SectionRow` en `/wod/programar`. Animación de entrada/
 * salida igual a la del modal de "Registrar tiempo" (mounted/visible +
 * transición de 300ms), pero horizontal en vez de vertical.
 */
export function BlockEditorPanel({
  mounted,
  visible,
  type,
  block,
  onClose,
  onToggle,
  onChange,
  onMovementChange,
  onAddMovement,
  onRemoveMovement,
  onCategoryChange,
  onAddCategory,
  onRemoveCategory,
}: BlockEditorPanelProps) {
  if (!mounted || !type || !block) return null;

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
          <p className="label-heading text-sm text-text-primary">{BLOCK_LABELS[type]}</p>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-text-primary">Incluir este bloque</span>
            <input
              type="checkbox"
              checked={block.included}
              onChange={(e) => onToggle(e.target.checked)}
              className="h-5 w-5 accent-black"
            />
          </label>

          {block.included && (
            <>
              <div className="flex gap-3">
                <Input
                  placeholder={BLOCK_FORMAT_HINTS[type]}
                  value={block.format}
                  onChange={(e) => onChange({ format: e.target.value })}
                  className="flex-[2]"
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Rondas"
                  value={block.rounds}
                  onChange={(e) => onChange({ rounds: e.target.value })}
                  className="flex-1"
                />
              </div>

              <div className="flex flex-col gap-2">
                {block.movements.map((movement, i) => (
                  <div key={i} className="flex flex-col gap-2 border border-border p-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ejercicio"
                        value={movement.name}
                        onChange={(e) => onMovementChange(i, { name: e.target.value })}
                        className="flex-[2]"
                      />
                      <Input
                        placeholder="Reps"
                        value={movement.reps}
                        onChange={(e) => onMovementChange(i, { reps: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={movement.weightType}
                        onChange={(e) =>
                          onMovementChange(i, { weightType: e.target.value as MovementForm["weightType"] })
                        }
                        className="h-[48px] flex-1 border border-border bg-white px-3 text-sm text-text-primary outline-none focus:border-black"
                      >
                        <option value="">Sin peso</option>
                        <option value="fixed">Peso fijo</option>
                        <option value="percentage">% RM</option>
                      </select>
                      <Input
                        placeholder={movement.weightType === "percentage" ? "Ej. 80%" : "Ej. 40 kg"}
                        value={movement.weightValue}
                        onChange={(e) => onMovementChange(i, { weightValue: e.target.value })}
                        disabled={!movement.weightType}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveMovement(i)}
                        aria-label="Quitar ejercicio"
                        className="flex h-[48px] w-[48px] shrink-0 items-center justify-center border border-border"
                      >
                        <Trash2 size={16} strokeWidth={1.5} className="text-text-primary" />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={onAddMovement} className={buttonClassName("outline")}>
                  Agregar ejercicio
                  <Plus size={16} strokeWidth={1.5} />
                </button>
              </div>

              <textarea
                placeholder="Observaciones (ej. descansa 15 seg. por ronda)"
                value={block.observations}
                onChange={(e) => onChange({ observations: e.target.value })}
                rows={2}
                className="w-full resize-none border border-border bg-white p-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-black"
              />

              {type === "wod" && onCategoryChange && onAddCategory && onRemoveCategory && (
                <div className="flex flex-col gap-2">
                  <p className="label-heading text-xs text-text-muted">Pesos por categoría</p>
                  {block.categories.map((category, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder="Categoría"
                        value={category.name}
                        onChange={(e) => onCategoryChange(i, { name: e.target.value })}
                        className="flex-[2]"
                      />
                      <Input
                        placeholder="Hombre"
                        value={category.weightMale}
                        onChange={(e) => onCategoryChange(i, { weightMale: e.target.value })}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Mujer"
                        value={category.weightFemale}
                        onChange={(e) => onCategoryChange(i, { weightFemale: e.target.value })}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveCategory(i)}
                        aria-label="Quitar categoría"
                        className="flex h-[48px] w-[48px] shrink-0 items-center justify-center border border-border"
                      >
                        <Trash2 size={16} strokeWidth={1.5} className="text-text-primary" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={onAddCategory} className={buttonClassName("outline")}>
                    Agregar categoría
                    <Plus size={16} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
