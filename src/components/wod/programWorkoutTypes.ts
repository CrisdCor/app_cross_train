import { DEFAULT_CATEGORY_NAMES, type SectionType, type WorkoutFormat } from "@/domain/Workout";

export interface ExerciseWeightForm {
  category: string;
  weightMale: string;
  weightFemale: string;
}

export interface ExerciseForm {
  name: string;
  reps: string;
  weights: ExerciseWeightForm[];
}

/** Un bloque de trabajo en edición (ej. "WOD A") dentro de una sección. */
export interface WorkBlockForm {
  key: string;
  label: string;
  format: WorkoutFormat;
  totalMinutes: string;
  totalSecondsPart: string;
  intervalMinutes: string;
  intervalSecondsPart: string;
  rounds: string;
  exercises: ExerciseForm[];
  observations: string[];
}

export type SectionsFormState = Record<SectionType, WorkBlockForm[]>;

export function emptyExercise(): ExerciseForm {
  return {
    name: "",
    reps: "",
    weights: DEFAULT_CATEGORY_NAMES.map((category) => ({ category, weightMale: "", weightFemale: "" })),
  };
}

export function emptyWorkBlock(): WorkBlockForm {
  return {
    key: crypto.randomUUID(),
    label: "",
    format: "amrap",
    totalMinutes: "",
    totalSecondsPart: "",
    intervalMinutes: "",
    intervalSecondsPart: "",
    rounds: "1",
    exercises: [emptyExercise()],
    observations: [],
  };
}
