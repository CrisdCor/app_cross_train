"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { WorkoutService } from "@/services/WorkoutService";
import { SECTION_ORDER, type SectionType, type WorkBlock } from "@/domain/Workout";
import { Button } from "@/components/ui/Button";
import { SectionRow } from "@/components/wod/SectionRow";
import { BlockEditorPanel } from "@/components/wod/BlockEditorPanel";
import type { SectionsFormState, WorkBlockForm } from "@/components/wod/programWorkoutTypes";

const TRANSITION_MS = 300;

interface ProgramWorkoutFormProps {
  communityId: string;
  workoutDate: string;
  initialBlocks: WorkBlock[];
}

/** "12" + "30" -> 750; vacío/ambos en blanco -> null. */
function toSeconds(minutes: string, seconds: string): number | null {
  if (!minutes.trim() && !seconds.trim()) return null;
  const min = Number(minutes) || 0;
  const sec = Number(seconds) || 0;
  return min * 60 + sec;
}

/** 750 -> { minutes: "12", seconds: "30" }; null -> partes vacías. */
function fromSeconds(totalSeconds: number | null): { minutes: string; seconds: string } {
  if (totalSeconds == null) return { minutes: "", seconds: "" };
  return { minutes: String(Math.floor(totalSeconds / 60)), seconds: String(totalSeconds % 60) };
}

function blockFromRow(row: WorkBlock): WorkBlockForm {
  const total = fromSeconds(row.totalSeconds);
  const interval = fromSeconds(row.intervalSeconds);
  return {
    key: crypto.randomUUID(),
    label: row.label,
    format: row.format,
    totalMinutes: total.minutes,
    totalSecondsPart: total.seconds,
    intervalMinutes: interval.minutes,
    intervalSecondsPart: interval.seconds,
    rounds: row.rounds != null ? String(row.rounds) : "1",
    exercises: row.exercises.map((e) => ({
      name: e.name,
      reps: e.reps,
      weights: e.weights.map((w) => ({ ...w })),
    })),
    observations: [...row.observations],
  };
}

function buildInitialState(initialBlocks: WorkBlock[]): SectionsFormState {
  return SECTION_ORDER.reduce((acc, type) => {
    acc[type] = initialBlocks
      .filter((b) => b.sectionType === type)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(blockFromRow);
    return acc;
  }, {} as SectionsFormState);
}

/**
 * Lista de las 7 secciones de la programación de un día (`SectionRow`);
 * tocar una abre `BlockEditorPanel`, un panel deslizante desde la derecha
 * con todos los bloques de trabajo de esa sección (una sección puede
 * tener varios, ej. "WOD A"/"WOD B") para crearlos/editarlos. El guardado
 * sigue siendo uno solo para todo el día (`save_workout` reemplaza el día
 * completo), así que el botón "Guardar programación" vive en la lista,
 * no dentro del panel.
 */
export function ProgramWorkoutForm({ communityId, workoutDate, initialBlocks }: ProgramWorkoutFormProps) {
  const [sections, setSections] = useState<SectionsFormState>(() => buildInitialState(initialBlocks));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [panelSection, setPanelSection] = useState<SectionType | null>(null);
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

  function openPanel(type: SectionType) {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setPanelSection(type);
    setPanelMounted(true);
  }

  function closePanel() {
    setPanelVisible(false);
    closeTimeout.current = setTimeout(() => {
      setPanelMounted(false);
      setPanelSection(null);
    }, TRANSITION_MS);
  }

  function changeSectionBlocks(type: SectionType, blocks: WorkBlockForm[]) {
    setSections((prev) => ({ ...prev, [type]: blocks }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: WorkBlock[] = SECTION_ORDER.flatMap((type) =>
      sections[type].map((block, index) => {
        const rounds = block.format === "for_time" ? Number(block.rounds) || 1 : null;
        // totalSeconds: duración total en EMOM/AMRAP, cap opcional en For Time.
        const totalSeconds = toSeconds(block.totalMinutes, block.totalSecondsPart);
        const intervalSeconds =
          block.format === "emom" ? toSeconds(block.intervalMinutes, block.intervalSecondsPart) : null;

        return {
          sectionType: type,
          orderIndex: index,
          label: block.label.trim(),
          format: block.format,
          totalSeconds,
          intervalSeconds,
          rounds,
          exercises: block.exercises
            .filter((ex) => ex.name.trim())
            .map((ex) => ({
              name: ex.name.trim(),
              reps: ex.reps.trim(),
              weights: ex.weights
                .filter((w) => w.category.trim())
                .map((w) => ({
                  category: w.category.trim(),
                  weightMale: w.weightMale.trim(),
                  weightFemale: w.weightFemale.trim(),
                })),
            })),
          observations: block.observations.map((o) => o.trim()).filter(Boolean),
        };
      })
    );

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
        {SECTION_ORDER.map((type) => (
          <SectionRow key={type} type={type} blocks={sections[type]} onClick={() => openPanel(type)} />
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
        sectionType={panelSection}
        blocks={panelSection ? sections[panelSection] : []}
        onClose={closePanel}
        onChangeBlocks={(blocks) => panelSection && changeSectionBlocks(panelSection, blocks)}
      />
    </form>
  );
}

