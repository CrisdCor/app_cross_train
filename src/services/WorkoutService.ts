import type { SupabaseClient } from "@supabase/supabase-js";
import { WorkoutRepository } from "@/repositories/WorkoutRepository";
import { Workout, type WorkoutBlock } from "@/domain/Workout";

export class WorkoutServiceError extends Error {}

/** Lógica de negocio de la programación diaria: leer y guardar el día completo. */
export class WorkoutService {
  private readonly repository: WorkoutRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.repository = new WorkoutRepository(supabase);
  }

  async getForDate(communityId: string, workoutDate: string): Promise<Workout | null> {
    const row = await this.repository.findForDate(communityId, workoutDate);
    if (!row) return null;
    return Workout.fromRow(row);
  }

  async save(communityId: string, workoutDate: string, blocks: WorkoutBlock[]): Promise<void> {
    const ok = await this.repository.save(communityId, workoutDate, blocks);
    if (!ok) {
      throw new WorkoutServiceError("No se pudo guardar la programación.");
    }
  }
}
