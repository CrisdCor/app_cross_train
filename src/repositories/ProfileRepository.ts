import type { SupabaseClient } from "@supabase/supabase-js";
import { Profile, type Gender, type ProfileRow } from "@/domain/Profile";

export interface ProfileUpdateInput {
  fullName?: string;
  bio?: string;
  programName?: string;
  avatarUrl?: string;
  gender?: Gender;
}

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

  async findByUsername(username: string): Promise<Profile | null> {
    const { data } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("username", username.toLowerCase())
      .maybeSingle<ProfileRow>();

    return data ? Profile.fromRow(data) : null;
  }

  /**
   * Actualiza el propio perfil (nombre, bio, programación, avatar). Permitido
   * por la política `profiles_update_own` — el rol está protegido aparte por
   * el trigger `prevent_role_self_escalation`, así que esta vía nunca puede
   * usarse para auto-ascenderse.
   */
  async updateOwnProfile(id: string, input: ProfileUpdateInput): Promise<Profile | null> {
    const patch: Record<string, string> = {};
    if (input.fullName !== undefined) patch.full_name = input.fullName;
    if (input.bio !== undefined) patch.bio = input.bio;
    if (input.programName !== undefined) patch.program_name = input.programName;
    if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;
    if (input.gender !== undefined) patch.gender = input.gender;

    const { data } = await this.supabase
      .from("profiles")
      .update(patch)
      .eq("id", id)
      .select("*")
      .maybeSingle<ProfileRow>();

    return data ? Profile.fromRow(data) : null;
  }
}
