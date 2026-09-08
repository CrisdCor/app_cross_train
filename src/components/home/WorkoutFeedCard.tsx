import Link from "next/link";
import type { Workout } from "@/domain/Workout";
import { BlockContent } from "@/components/wod/BlockContent";

interface WorkoutFeedCardProps {
  workout: Workout;
}

/** Tarjeta de feed en /home con la programación de hoy, bloque por bloque. */
export function WorkoutFeedCard({ workout }: WorkoutFeedCardProps) {
  return (
    <div className="flex flex-col gap-5 border border-border p-5">
      <div className="flex items-center justify-between">
        <p className="label-heading text-sm text-text-primary">Programación de hoy</p>
        <Link
          href="/wod"
          className="label-heading text-xs text-text-primary underline underline-offset-4"
        >
          Ver completo
        </Link>
      </div>

      <div className="flex flex-col gap-5">
        {workout.blocks.map((block) => (
          <div key={block.blockType} className="border-t border-border pt-5 first:border-t-0 first:pt-0">
            <BlockContent blockType={block.blockType} block={block} />
          </div>
        ))}
      </div>
    </div>
  );
}
