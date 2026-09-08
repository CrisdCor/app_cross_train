import { blockLabel, type Workout } from "@/domain/Workout";
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
  const highlight = workout.getBlock("wod") ?? workout.blocks[0];
  const movementsPreview = highlight?.movements.slice(0, 3) ?? [];
  const hasMoreMovements = (highlight?.movements.length ?? 0) > movementsPreview.length;

  return (
    <div className="border border-border p-5">
      <p className="label-heading text-sm text-text-primary">Programación de hoy</p>

      {highlight ? (
        <div className="mt-3">
          <p className="label-heading text-xs text-text-muted">{blockLabel(highlight.blockType)}</p>
          {highlight.format && (
            <p className="mt-1 text-[15px] font-bold text-text-primary">{highlight.format}</p>
          )}
          {movementsPreview.length > 0 && (
            <p className="mt-1 text-sm text-text-secondary">
              {movementsPreview
                .map((m) => [m.reps, m.name].filter(Boolean).join(" "))
                .join(" · ")}
              {hasMoreMovements && "…"}
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
