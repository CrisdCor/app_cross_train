import { SECTION_LABELS, formatSummaryLine, type Workout } from "@/domain/Workout";
import { FeedPostActions } from "@/components/home/FeedPostActions";

interface WorkoutFeedCardProps {
  workout: Workout;
}

/**
 * Publicación del feed de /home con un resumen breve de la programación de
 * hoy (no el WOD completo — para eso está /wod) y las acciones de una
 * publicación de red social (reaccionar, comentar, ir a la publicación).
 */
export function WorkoutFeedCard({ workout }: WorkoutFeedCardProps) {
  const highlight = workout.blocksForSection("wod")[0] ?? workout.blocks[0];
  const exercisesPreview = highlight?.exercises.slice(0, 3) ?? [];
  const hasMoreExercises = (highlight?.exercises.length ?? 0) > exercisesPreview.length;

  return (
    <div className="border border-border p-5">
      <p className="label-heading text-sm text-text-primary">Programación de hoy</p>

      {highlight ? (
        <div className="mt-3">
          <p className="label-heading text-xs text-text-muted">{SECTION_LABELS[highlight.sectionType]}</p>
          <p className="mt-1 text-[15px] font-bold text-text-primary">{formatSummaryLine(highlight)}</p>
          {exercisesPreview.length > 0 && (
            <p className="mt-1 text-sm text-text-secondary">
              {exercisesPreview
                .map((e) => [e.reps, e.name].filter(Boolean).join(" "))
                .join(" · ")}
              {hasMoreExercises && "…"}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-muted">Aún no hay contenido publicado hoy.</p>
      )}

      <FeedPostActions href="/wod" />
    </div>
  );
}
