import type { BlockType } from "@/domain/Workout";

export interface MovementForm {
  name: string;
  reps: string;
  weightType: "" | "fixed" | "percentage";
  weightValue: string;
}

export interface CategoryForm {
  name: string;
  weightMale: string;
  weightFemale: string;
}

export interface BlockForm {
  included: boolean;
  format: string;
  rounds: string;
  observations: string;
  movements: MovementForm[];
  categories: CategoryForm[];
}

export type BlocksFormState = Record<BlockType, BlockForm>;
