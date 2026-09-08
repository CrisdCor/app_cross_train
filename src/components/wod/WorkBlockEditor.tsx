"use client";

import { Plus, Trash2 } from "lucide-react";
import { FORMAT_LABELS, FORMAT_ORDER, type WorkoutFormat } from "@/domain/Workout";
import { emptyExercise, type ExerciseForm, type ExerciseWeightForm, type WorkBlockForm } from "@/components/wod/programWorkoutTypes";
import { Input } from "@/components/ui/Input";
import { buttonClassName } from "@/components/ui/Button";

interface WorkBlockEditorProps {
  block: WorkBlockForm;
  index: number;
  onChange: (block: WorkBlockForm) => void;
  onRemove: () => void;
}

/**
 * Editor de un bloque de trabajo (ej. "WOD A") dentro de una sección:
 * etiqueta, formato (EMOM/AMRAP/For Time) con su configuración de tiempo
 * o rondas, lista de ejercicios (cada uno con su tabla de peso por
 * categoría y género) y observaciones como lista agregable.
 */
export function WorkBlockEditor({ block, index, onChange, onRemove }: WorkBlockEditorProps) {
  function patch(fields: Partial<WorkBlockForm>) {
    onChange({ ...block, ...fields });
  }

  function updateExercise(i: number, fields: Partial<ExerciseForm>) {
    onChange({ ...block, exercises: block.exercises.map((e, idx) => (idx === i ? { ...e, ...fields } : e)) });
  }

  function addExercise() {
    onChange({ ...block, exercises: [...block.exercises, emptyExercise()] });
  }

  function removeExercise(i: number) {
    onChange({ ...block, exercises: block.exercises.filter((_, idx) => idx !== i) });
  }

  function updateWeight(exerciseIndex: number, weightIndex: number, fields: Partial<ExerciseWeightForm>) {
    onChange({
      ...block,
      exercises: block.exercises.map((e, idx) =>
        idx === exerciseIndex
          ? { ...e, weights: e.weights.map((w, wIdx) => (wIdx === weightIndex ? { ...w, ...fields } : w)) }
          : e
      ),
    });
  }

  function addWeight(exerciseIndex: number) {
    onChange({
      ...block,
      exercises: block.exercises.map((e, idx) =>
        idx === exerciseIndex
          ? { ...e, weights: [...e.weights, { category: "", weightMale: "", weightFemale: "" }] }
          : e
      ),
    });
  }

  function removeWeight(exerciseIndex: number, weightIndex: number) {
    onChange({
      ...block,
      exercises: block.exercises.map((e, idx) =>
        idx === exerciseIndex ? { ...e, weights: e.weights.filter((_, wIdx) => wIdx !== weightIndex) } : e
      ),
    });
  }

  function updateObservation(i: number, value: string) {
    onChange({ ...block, observations: block.observations.map((o, idx) => (idx === i ? value : o)) });
  }

  function addObservation() {
    onChange({ ...block, observations: [...block.observations, ""] });
  }

  function removeObservation(i: number) {
    onChange({ ...block, observations: block.observations.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="flex flex-col gap-4 border border-border p-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder={`Etiqueta (ej. "A") — bloque ${index + 1}`}
          value={block.label}
          onChange={(e) => patch({ label: e.target.value })}
          className="flex-1"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Quitar bloque de trabajo"
          className="flex h-[48px] w-[48px] shrink-0 items-center justify-center border border-border"
        >
          <Trash2 size={16} strokeWidth={1.5} className="text-text-primary" />
        </button>
      </div>

      <select
        value={block.format}
        onChange={(e) => patch({ format: e.target.value as WorkoutFormat })}
        className="h-[48px] w-full border border-border bg-white px-3 text-sm text-text-primary outline-none focus:border-black"
      >
        {FORMAT_ORDER.map((format) => (
          <option key={format} value={format}>
            {FORMAT_LABELS[format]}
          </option>
        ))}
      </select>

      {(block.format === "emom" || block.format === "amrap") && (
        <div className="flex flex-col gap-2">
          <p className="label-heading text-xs text-text-muted">Tiempo total del WOD</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="min"
              value={block.totalMinutes}
              onChange={(e) => patch({ totalMinutes: e.target.value })}
              className="flex-1"
            />
            <span className="text-text-muted">:</span>
            <Input
              type="number"
              min={0}
              max={59}
              placeholder="seg"
              value={block.totalSecondsPart}
              onChange={(e) => patch({ totalSecondsPart: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      )}

      {block.format === "emom" && (
        <div className="flex flex-col gap-2">
          <p className="label-heading text-xs text-text-muted">Tiempo por ronda (ventana)</p>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="min"
              value={block.intervalMinutes}
              onChange={(e) => patch({ intervalMinutes: e.target.value })}
              className="flex-1"
            />
            <span className="text-text-muted">:</span>
            <Input
              type="number"
              min={0}
              max={59}
              placeholder="seg"
              value={block.intervalSecondsPart}
              onChange={(e) => patch({ intervalSecondsPart: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      )}

      {block.format === "for_time" && (
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <p className="label-heading text-xs text-text-muted">Rondas (1 = chipper)</p>
            <Input
              type="number"
              min={1}
              value={block.rounds}
              onChange={(e) => patch({ rounds: e.target.value })}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="label-heading text-xs text-text-muted">Cap de tiempo (opcional)</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="min"
                value={block.totalMinutes}
                onChange={(e) => patch({ totalMinutes: e.target.value })}
              />
              <span className="text-text-muted">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                placeholder="seg"
                value={block.totalSecondsPart}
                onChange={(e) => patch({ totalSecondsPart: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="label-heading text-xs text-text-muted">Ejercicios</p>
        {block.exercises.map((exercise, exerciseIndex) => (
          <div key={exerciseIndex} className="flex flex-col gap-2 border border-border p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ejercicio"
                value={exercise.name}
                onChange={(e) => updateExercise(exerciseIndex, { name: e.target.value })}
                className="flex-[2]"
              />
              <Input
                placeholder="Reps"
                value={exercise.reps}
                onChange={(e) => updateExercise(exerciseIndex, { reps: e.target.value })}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeExercise(exerciseIndex)}
                aria-label="Quitar ejercicio"
                className="flex h-[48px] w-[48px] shrink-0 items-center justify-center border border-border"
              >
                <Trash2 size={16} strokeWidth={1.5} className="text-text-primary" />
              </button>
            </div>

            <p className="label-heading text-[11px] text-text-muted">
              Peso por categoría (lbs) — deja en blanco si no aplica (ej. gimnasia) y describe la variante en
              observaciones
            </p>
            <div className="flex flex-col gap-1.5">
              {exercise.weights.map((weight, weightIndex) => (
                <div key={weightIndex} className="flex gap-1.5">
                  <Input
                    placeholder="Categoría"
                    value={weight.category}
                    onChange={(e) => updateWeight(exerciseIndex, weightIndex, { category: e.target.value })}
                    className="flex-[2]"
                  />
                  <Input
                    placeholder="Hombre"
                    value={weight.weightMale}
                    onChange={(e) => updateWeight(exerciseIndex, weightIndex, { weightMale: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Mujer"
                    value={weight.weightFemale}
                    onChange={(e) => updateWeight(exerciseIndex, weightIndex, { weightFemale: e.target.value })}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeWeight(exerciseIndex, weightIndex)}
                    aria-label="Quitar categoría"
                    className="flex h-[48px] w-[36px] shrink-0 items-center justify-center border border-border"
                  >
                    <Trash2 size={14} strokeWidth={1.5} className="text-text-primary" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addWeight(exerciseIndex)}
                className={buttonClassName("outline")}
              >
                Agregar categoría
                <Plus size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addExercise} className={buttonClassName("outline")}>
          Agregar ejercicio
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="label-heading text-xs text-text-muted">Observaciones</p>
        {block.observations.map((observation, i) => (
          <div key={i} className="flex gap-2">
            <Input
              placeholder="Ej. descansa 15 seg. por ronda"
              value={observation}
              onChange={(e) => updateObservation(i, e.target.value)}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeObservation(i)}
              aria-label="Quitar observación"
              className="flex h-[48px] w-[48px] shrink-0 items-center justify-center border border-border"
            >
              <Trash2 size={16} strokeWidth={1.5} className="text-text-primary" />
            </button>
          </div>
        ))}
        <button type="button" onClick={addObservation} className={buttonClassName("outline")}>
          Agregar observación
          <Plus size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
