export type SectionType =
  | "warmup"
  | "strength"
  | "weightlifting"
  | "gymnastics"
  | "metcon"
  | "wod"
  | "accessories";

export const SECTION_ORDER: SectionType[] = [
  "warmup",
  "strength",
  "weightlifting",
  "gymnastics",
  "metcon",
  "wod",
  "accessories",
];

export const SECTION_LABELS: Record<SectionType, string> = {
  warmup: "Calentamiento",
  strength: "Fuerza",
  weightlifting: "Levantamiento",
  gymnastics: "Gimnasia",
  metcon: "Metcon",
  wod: "Wod",
  accessories: "Accesorios",
};

export type WorkoutFormat = "emom" | "amrap" | "for_time";

export const FORMAT_ORDER: WorkoutFormat[] = ["emom", "amrap", "for_time"];

export const FORMAT_LABELS: Record<WorkoutFormat, string> = {
  emom: "EMOM",
  amrap: "AMRAP",
  for_time: "For Time",
};

/** Categorías de peso por defecto para un ejercicio nuevo — editables. */
export const DEFAULT_CATEGORY_NAMES = ["Principiante", "Intermedio", "Avanzado", "RX"];

export interface ExerciseWeight {
  category: string;
  weightMale: string;
  weightFemale: string;
}

/**
 * Un ejercicio dentro de un bloque de trabajo: repeticiones + nombre +
 * tabla de peso (lbs) por categoría, con variante hombre/mujer. Para
 * ejercicios de gimnasia sin peso, la tabla queda vacía y la variante se
 * describe en las observaciones del bloque.
 */
export interface WorkBlockExercise {
  name: string;
  reps: string;
  weights: ExerciseWeight[];
}

/**
 * Un bloque de trabajo dentro de una sección (ej. "WOD A", "WOD B") — una
 * sección puede tener varios. Los campos de tiempo/rondas aplican según
 * el formato: EMOM usa totalSeconds (duración total) + intervalSeconds
 * (ventana por ronda, no siempre 1 minuto); AMRAP usa solo totalSeconds;
 * For Time usa rounds (1 = chipper) y opcionalmente totalSeconds como
 * time cap.
 */
export interface WorkBlock {
  sectionType: SectionType;
  orderIndex: number;
  label: string;
  format: WorkoutFormat;
  totalSeconds: number | null;
  intervalSeconds: number | null;
  rounds: number | null;
  exercises: WorkBlockExercise[];
  observations: string[];
}

export interface WorkoutRow {
  id: string;
  workoutDate: string;
  blocks: WorkBlock[];
}

/** Formatea segundos como "12:00" / "3:30" — vacío si no aplica. */
export function formatMinutesSeconds(totalSeconds: number | null): string {
  if (totalSeconds == null) return "";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Línea de resumen del formato + su configuración de tiempo/rondas para un bloque. */
export function formatSummaryLine(block: WorkBlock): string {
  const parts: string[] = [FORMAT_LABELS[block.format]];
  if (block.format === "emom") {
    if (block.totalSeconds != null) parts.push(formatMinutesSeconds(block.totalSeconds));
    if (block.intervalSeconds != null) parts.push(`cada ${formatMinutesSeconds(block.intervalSeconds)}`);
  } else if (block.format === "amrap") {
    if (block.totalSeconds != null) parts.push(formatMinutesSeconds(block.totalSeconds));
  } else if (block.format === "for_time") {
    if (block.rounds != null) parts.push(block.rounds === 1 ? "1 ronda" : `${block.rounds} rondas`);
    if (block.totalSeconds != null) parts.push(`cap ${formatMinutesSeconds(block.totalSeconds)}`);
  }
  return parts.join(" · ");
}

/**
 * Entidad de dominio: la programación de un día para una comunidad, en
 * sus 7 secciones fijas — cada una con cero o más bloques de trabajo.
 */
export class Workout {
  constructor(
    public readonly id: string,
    public readonly workoutDate: string,
    public readonly blocks: WorkBlock[]
  ) {}

  static fromRow(row: WorkoutRow): Workout {
    return new Workout(row.id, row.workoutDate, row.blocks);
  }

  blocksForSection(type: SectionType): WorkBlock[] {
    return this.blocks
      .filter((b) => b.sectionType === type)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  get isEmpty(): boolean {
    return this.blocks.length === 0;
  }
}

export function sectionLabel(type: SectionType): string {
  return SECTION_LABELS[type];
}
