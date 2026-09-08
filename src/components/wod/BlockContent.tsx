import { blockLabel, type BlockType, type WorkoutBlock } from "@/domain/Workout";
import { RegisterTimeButton } from "@/components/wod/RegisterTimeButton";

interface BlockContentProps {
  blockType: BlockType;
  block: WorkoutBlock | undefined;
  showRegisterButton?: boolean;
  compact?: boolean;
}

const WEIGHT_TYPE_LABEL: Record<"fixed" | "percentage", string> = {
  fixed: "Peso",
  percentage: "% RM",
};

/** Contenido de un bloque de la programación (calentamiento, fuerza, habilidad, wod o accesorios). */
export function BlockContent({ blockType, block, showRegisterButton = false, compact = false }: BlockContentProps) {
  if (!block) {
    return (
      <div className={compact ? "" : "flex flex-1 flex-col items-center justify-center text-center"}>
        <p className="text-sm text-text-muted">Sin {blockLabel(blockType).toLowerCase()} programado.</p>
      </div>
    );
  }

  const formatLine = [block.format, block.rounds ? `${block.rounds} rondas` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-4">
      {!compact && (
        <p className="label-heading text-xs text-text-muted">{blockLabel(blockType)}</p>
      )}

      {formatLine && <p className="text-[15px] font-bold text-text-primary">{formatLine}</p>}

      {block.movements.length > 0 && (
        <ol className="flex flex-col gap-2">
          {block.movements.map((movement, i) => (
            <li key={i} className="flex items-baseline gap-2 text-sm text-text-secondary">
              <span className="shrink-0 text-text-muted">{i + 1}.</span>
              <span className="flex-1">
                {[movement.reps, movement.name].filter(Boolean).join(" ")}
                {movement.weightType && movement.weightValue.trim() && (
                  <span className="text-text-muted">
                    {" "}
                    — {WEIGHT_TYPE_LABEL[movement.weightType]}: {movement.weightValue}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}

      {block.observations.trim() && (
        <p className="text-sm italic text-text-muted">{block.observations}</p>
      )}

      {block.categories.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="label-heading py-2 pr-2 text-left text-[11px] text-text-muted">
                  Categoría
                </th>
                <th className="label-heading py-2 pr-2 text-right text-[11px] text-text-muted">
                  Hombre
                </th>
                <th className="label-heading py-2 text-right text-[11px] text-text-muted">
                  Mujer
                </th>
              </tr>
            </thead>
            <tbody>
              {block.categories.map((category, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="py-2 pr-2 text-text-primary">{category.name}</td>
                  <td className="py-2 pr-2 text-right text-text-secondary">{category.weightMale}</td>
                  <td className="py-2 text-right text-text-secondary">{category.weightFemale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showRegisterButton && blockType === "wod" && <RegisterTimeButton />}
    </div>
  );
}
