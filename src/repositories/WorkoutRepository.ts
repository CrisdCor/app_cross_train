import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkBlock, WorkoutRow } from "@/domain/Workout";

/** Único punto de acceso a la programación diaria — ambas RPC son SECURITY DEFINER. */
export class WorkoutRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findForDate(communityId: string, workoutDate: string): Promise<WorkoutRow | null> {
    const { data, error } = await this.supabase.rpc("get_workout", {
      p_community_id: communityId,
      p_workout_date: workoutDate,
    });

    if (error || !data) return null;
    return data as WorkoutRow;
  }

  async save(communityId: string, workoutDate: string, blocks: WorkBlock[]): Promise<boolean> {
    const { error } = await this.supabase.rpc("save_workout", {
      p_community_id: communityId,
      p_workout_date: workoutDate,
      p_blocks: blocks,
    });

    return !error;
  }
}
