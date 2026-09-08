"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { WorkoutService } from "@/services/WorkoutService";
import {
  BLOCK_FORMAT_HINTS,
  BLOCK_LABELS,
  BLOCK_ORDER,
  type BlockType,
  type WorkoutBlock,
} from "@/domain/Workout";
import { Input } from "@/components/ui/Input";
import { Button, buttonClassName } from "@/components/ui/Button";

interface ProgramWorkoutFormProps {
  communityId: string;
  workoutDate: string;
  initialBlocks: WorkoutBlock[];
}

interface MovementForm {
  name: string;
  reps: string;
  weightType: "" | "fixed" | "percentage";
  weightValue: string;
}

interface CategoryForm {
  name: string;
  weightMale: string;
  weightFemale: string;
}

interface BlockForm {
  included: boolean;
  format: string;
  rounds: string;
  observations: string;
  movements: MovementForm[];
  categories: CategoryForm[];
}

type BlocksFormState = Record<BlockType, BlockForm>;

const EMPTY_MOVEMENT: MovementForm = { name: "", reps: "", weightType: "", weightValue: "" };

const DEFAULT_WOD_CATEGORIES: CategoryForm[] = [
  { name: "Principiante", weightMale: "", weightFemale: "" },
  { name: "Intermedio", weightMale: "", weightFemale: "" },
  { name: "Avanzado", weightMale: "", weightFemale: "" },
  { name: "RX", weightMale: "", weightFemale: "" },
];

function buildInitialState(initialBlocks: WorkoutBlock[]): BlocksFormState {
  return BLOCK_ORDER.reduce((acc, type) => {
    const existing = initialBlocks.find((b) => b.blockType === type);
    acc[type] = {
      included: Boolean(existing),
      format: existing?.format ?? "",
      rounds: existing?.rounds != null ? String(existing.rounds) : "",
      observations: existing?.observations ?? "",
      movements:
        existing && existing.movements.length > 0
          ? existing.movements.map((m) => ({
              name: m.name,
              reps: m.reps,
              weightType: m.weightType ?? "",
              weightValue: m.weightValue,
            }))
          : [{ ...EMPTY_MOVEMENT }],
      categories:
        type === "wod"
          ? existing && existing.categories.length > 0
            ? existing.categories.map((c) => ({
                name: c.name,
                weightMale: c.weightMale,
                weightFemale: c.weightFemale,
              }))
            : DEFAULT_WOD_CATEGORIES.map((c) => ({ ...c }))
          : [],
    };
    return acc;
  }, {} as BlocksFormState);
}

export function ProgramWorkoutForm({ communityId, workoutDate, initialBlocks }: ProgramWorkoutFormProps) {
  const [blocks, setBlocks] = useState<BlocksFormState>(() => buildInitialState(initialBlocks));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateBlock(type: BlockType, patch: Partial<BlockForm>) {
    setBlocks((prev) => ({ ...prev, [type]: { ...prev[type], ...patch } }));
  }

  function updateMovement(type: BlockType, index: number, patch: Partial<MovementForm>) {
    setBlocks((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        movements: prev[type].movements.map((m, i) => (i === index ? { ...m, ...patch } : m)),
      },
    }));
  }

  function addMovement(type: BlockType) {
    setBlocks((prev) => ({
      ...prev,
      [type]: { ...prev[type], movements: [...prev[type].movements, { ...EMPTY_MOVEMENT }] },
    }));
  }

  function removeMovement(type: BlockType, index: number) {
    setBlocks((prev) => ({
      ...prev,
      [type]: { ...prev[type], movements: prev[type].movements.filter((_, i) => i !== index) },
    }));
  }

  function updateCategory(index: number, patch: Partial<CategoryForm>) {
    setBlocks((prev) => ({
      ...prev,
      wod: {
        ...prev.wod,
        categories: prev.wod.categories.map((c, i) => (i === index ? { ...c, ...patch } : c)),
      },
    }));
  }

  function addCategory() {
    setBlocks((prev) => ({
      ...prev,
      wod: { ...prev.wod, categories: [...prev.wod.categories, { name: "", weightMale: "", weightFemale: "" }] },
    }));
  }

  function removeCategory(index: number) {
    setBlocks((prev) => ({
      ...prev,
      wod: { ...prev.wod, categories: prev.wod.categories.filter((_, i) => i !== index) },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: WorkoutBlock[] = BLOCK_ORDER.filter((type) => blocks[type].included).map((type) => {
      const b = blocks[type];
      return {
        blockType: type,
        format: b.format.trim(),
        rounds: b.rounds.trim() ? Number(b.rounds) : null,
        observations: b.observations.trim(),
        movements: b.movements
          .filter((m) => m.name.trim())
          .map((m) => ({
            name: m.name.trim(),
            reps: m.reps.trim(),
            weightType: m.weightType || null,
            weightValue: m.weightValue.trim(),
          })),
        categories:
          type === "wod"
            ? b.categories
                .filter((c) => c.name.trim())
                .map((c) => ({
                  name: c.name.trim(),
                  weightMale: c.weightMale.trim(),
                  weightFemale: c.weightFemale.trim(),
                }))
            : [],
      };
    });

    try {
      const service = new WorkoutService(createClient());
      await service.save(communityId, workoutDate, payload);
      // Navegación dura: /wod es un Server Component que debe leer la
      // programación recién guardada, no una versión cacheada.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/wod?date=${workoutDate}`;
    } catch {
      setLoading(false);
      setError("No se pudo guardar la programación.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-6">
      {BLOCK_ORDER.map((type) => (
        <BlockEditor
          key={type}
          type={type}
          block={blocks[type]}
          onToggle={(included) => updateBlock(type, { included })}
          onChange={(patch) => updateBlock(type, patch)}
          onMovementChange={(i, patch) => updateMovement(type, i, patch)}
          onAddMovement={() => addMovement(type)}
          onRemoveMovement={(i) => removeMovement(type, i)}
          onCategoryChange={type === "wod" ? updateCategory : undefined}
          onAddCategory={type === "wod" ? addCategory : undefined}
          onRemoveCategory={type === "wod" ? removeCategory : undefined}
        />
      ))}

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : "Guardar programación"}
      </Button>
    </form>
  );
}

interface BlockEditorProps {
  type: BlockType;
  block: BlockForm;
  onToggle: (included: boolean) => void;
  onChange: (patch: Partial<BlockForm>) => void;
  onMovementChange: (index: number, patch: Partial<MovementForm>) => void;
  onAddMovement: () => void;
  onRemoveMovement: (index: number) => void;
  onCategoryChange?: (index: number, patch: Partial<CategoryForm>) => void;
  onAddCategory?: () => void;
  onRemoveCategory?: (index: number) => void;
}

function BlockEditor({
  type,
  block,
  onToggle,
  onChange,
  onMovementChange,
  onAddMovement,
  onRemoveMovement,
  onCategoryChange,
  onAddCategory,
  onRemoveCategory,
}: BlockEditorProps) {
  return (
    <div className="border border-border">
      <label className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3">
        <span className="label-heading text-sm text-text-primary">{BLOCK_LABELS[type]}</span>
        <input
          type="checkbox"
          checked={block.included}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-5 w-5 accent-black"
        />
      </label>

      {block.included && (
        <div className="flex flex-col gap-4 p-4">
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
        </div>
      )}
    </div>
  );
}
