"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { WorkoutService } from "@/services/WorkoutService";
import { BLOCK_ORDER, type BlockType, type WorkoutBlock } from "@/domain/Workout";
import { Button } from "@/components/ui/Button";
import { SectionRow } from "@/components/wod/SectionRow";
import { BlockEditorPanel } from "@/components/wod/BlockEditorPanel";
import type { BlockForm, BlocksFormState, CategoryForm, MovementForm } from "@/components/wod/programWorkoutTypes";

const TRANSITION_MS = 300;

interface ProgramWorkoutFormProps {
  communityId: string;
  workoutDate: string;
  initialBlocks: WorkoutBlock[];
}

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

/**
 * Lista de las 5 secciones de la programación de un día (`SectionRow`);
 * tocar una abre `BlockEditorPanel`, un panel deslizante desde la derecha
 * con el detalle de esa sección para crearla/editarla. El guardado sigue
 * siendo uno solo para todo el día (`save_workout` reemplaza el día
 * completo), así que el botón "Guardar programación" vive en la lista,
 * no dentro de cada panel.
 */
export function ProgramWorkoutForm({ communityId, workoutDate, initialBlocks }: ProgramWorkoutFormProps) {
  const [blocks, setBlocks] = useState<BlocksFormState>(() => buildInitialState(initialBlocks));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [panelType, setPanelType] = useState<BlockType | null>(null);
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!panelMounted) return;
    const raf = requestAnimationFrame(() => setPanelVisible(true));
    return () => cancelAnimationFrame(raf);
  }, [panelMounted]);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, []);

  function openPanel(type: BlockType) {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setPanelType(type);
    setPanelMounted(true);
  }

  function closePanel() {
    setPanelVisible(false);
    closeTimeout.current = setTimeout(() => {
      setPanelMounted(false);
      setPanelType(null);
    }, TRANSITION_MS);
  }

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
    <form onSubmit={handleSubmit} className="flex flex-col pt-6">
      <div className="flex flex-col border-t border-border">
        {BLOCK_ORDER.map((type) => (
          <SectionRow key={type} type={type} block={blocks[type]} onClick={() => openPanel(type)} />
        ))}
      </div>

      {error && (
        <p className="mt-6 text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" className="mt-6" disabled={loading}>
        {loading ? "Guardando…" : "Guardar programación"}
      </Button>

      <BlockEditorPanel
        mounted={panelMounted}
        visible={panelVisible}
        type={panelType}
        block={panelType ? blocks[panelType] : null}
        onClose={closePanel}
        onToggle={(included) => panelType && updateBlock(panelType, { included })}
        onChange={(patch) => panelType && updateBlock(panelType, patch)}
        onMovementChange={(i, patch) => panelType && updateMovement(panelType, i, patch)}
        onAddMovement={() => panelType && addMovement(panelType)}
        onRemoveMovement={(i) => panelType && removeMovement(panelType, i)}
        onCategoryChange={panelType === "wod" ? updateCategory : undefined}
        onAddCategory={panelType === "wod" ? addCategory : undefined}
        onRemoveCategory={panelType === "wod" ? removeCategory : undefined}
      />
    </form>
  );
}
