export type BlockType = "warmup" | "strength" | "skill" | "wod" | "accessories";

export type WeightType = "fixed" | "percentage" | null;

export interface WorkoutMovement {
  name: string;
  reps: string;
  weightType: WeightType;
  weightValue: string;
}

export interface WodCategory {
  name: string;
  weightMale: string;
  weightFemale: string;
}

export interface WorkoutBlock {
  blockType: BlockType;
  format: string;
  rounds: number | null;
  observations: string;
  movements: WorkoutMovement[];
  categories: WodCategory[];
}

export interface WorkoutRow {
  id: string;
  workoutDate: string;
  blocks: WorkoutBlock[];
}

export const BLOCK_ORDER: BlockType[] = ["warmup", "strength", "skill", "wod", "accessories"];

export const BLOCK_LABELS: Record<BlockType, string> = {
  warmup: "Calentamiento",
  strength: "Fuerza",
  skill: "Habilidad",
  wod: "WOD",
  accessories: "Accesorios",
};

export const BLOCK_FORMAT_HINTS: Record<BlockType, string> = {
  warmup: "Ej. AMRAP 8 minutos, EMOM, FOR TIME…",
  strength: "Ej. 5 rondas, FOR TIME…",
  skill: "Ej. 4 series, EMOM…",
  wod: "Ej. AMRAP 10 minutos, FOR TIME 21-15-9…",
  accessories: "Ej. 3 series, opcional",
};

/**
 * Entidad de dominio: la programación de un día para una comunidad, ya
 * armada en sus 5 bloques fijos por get_workout(). Encapsula el acceso a
 * un bloque puntual para que las vistas no busquen en el arreglo a mano.
 */
export class Workout {
  constructor(
    public readonly id: string,
    public readonly workoutDate: string,
    public readonly blocks: WorkoutBlock[]
  ) {}

  static fromRow(row: WorkoutRow): Workout {
    return new Workout(row.id, row.workoutDate, row.blocks);
  }

  getBlock(type: BlockType): WorkoutBlock | undefined {
    return this.blocks.find((b) => b.blockType === type);
  }

  get isEmpty(): boolean {
    return this.blocks.length === 0;
  }
}

export function blockLabel(type: BlockType): string {
  return BLOCK_LABELS[type];
}
