import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role } from "@/domain/Profile";

export class AdminServiceError extends Error {}

export interface AdminProfileResult {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
}

interface AdminSearchRow {
  id: string;
  username: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

/**
 * Acciones exclusivas del Administrador: buscar cualquier usuario y
 * promoverlo a Head Coach. Ambas pasan por RPCs que verifican `is_admin()`
 * del lado del servidor — esta clase nunca confía en que la UI oculte el
 * botón.
 */
export class AdminService {
  constructor(private readonly supabase: SupabaseClient) {}

  async searchProfiles(query: string): Promise<AdminProfileResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const { data, error } = await this.supabase.rpc("admin_search_profiles", {
      p_query: trimmed,
    });

    if (error || !data) return [];

    return (data as AdminSearchRow[]).map((row) => ({
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      role: row.role as Role,
      avatarUrl: row.avatar_url,
    }));
  }

  async promoteToHeadCoach(profileId: string): Promise<void> {
    const { error } = await this.supabase.rpc("admin_promote_to_head_coach", {
      p_profile_id: profileId,
    });

    if (!error) return;

    if (error.message.includes("already_head_coach")) {
      throw new AdminServiceError("Ese usuario ya es Head Coach.");
    }
    if (error.message.includes("cannot_change_admin_role")) {
      throw new AdminServiceError("No puedes cambiar el rol de un Administrador desde aquí.");
    }
    throw new AdminServiceError("No se pudo promover al usuario.");
  }
}
