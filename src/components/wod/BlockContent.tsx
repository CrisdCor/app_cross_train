import { formatSummaryLine, type WorkBlock, type WorkBlockExercise } from "@/domain/Workout";

interface BlockContentProps {
  block: WorkBlock;
}

/** "RX 135/95 · Intermedio 95/85" — vacío si el ejercicio no tiene tabla de pesos. */
function weightsSummary(exercise: WorkBlockExercise): string {
  return exercise.weights
    .filter((w) => w.weightMale.trim() || w.weightFemale.trim())
    .map((w) => `${w.category} ${w.weightMale || "—"}/${w.weightFemale || "—"}`)
    .join(" · ");
}

/** Contenido de un bloque de trabajo (ej. "WOD A") dentro de una sección de la programación. */
export function BlockContent({ block }: BlockContentProps) {
  return (
    <div className="flex flex-col gap-3">
      {block.label.trim() && <p className="label-heading text-xs text-text-muted">{block.label}</p>}

      <p className="text-[15px] font-bold text-text-primary">{formatSummaryLine(block)}</p>

      {block.exercises.length > 0 && (
        <ol className="flex flex-col gap-2">
          {block.exercises.map((exercise, i) => {
            const weights = weightsSummary(exercise);
            return (
              <li key={i} className="flex items-baseline gap-2 text-sm text-text-secondary">
                <span className="shrink-0 text-text-muted">{i + 1}.</span>
                <span className="flex-1">
                  {[exercise.reps, exercise.name].filter(Boolean).join(" ")}
                  {weights && <span className="text-text-muted"> — {weights}</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {block.observations.length > 0 && (
        <div className="border border-border p-3">
          <ul className="flex list-none flex-col gap-1.5 text-sm text-text-secondary">
            {block.observations.map((observation, i) => (
              <li key={i}>{observation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
