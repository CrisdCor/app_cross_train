import type { SupabaseClient } from "@supabase/supabase-js";
import { Profile, type ProfileRow } from "@/domain/Profile";

/**
 * Único punto de acceso a la tabla `profiles`. Los Server/Client Components
 * y servicios nunca llaman a `.from("profiles")` directamente — siempre a
 * través de este repositorio, que devuelve entidades de dominio.
 */
export class ProfileRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Profile | null> {
    const { data } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle<ProfileRow>();

    return data ? Profile.fromRow(data) : null;
  }
}
