import type { SupabaseClient } from "@supabase/supabase-js";

export class CommunityServiceError extends Error {}

export interface HeadCoachResult {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  communityId: string;
  communityName: string;
}

interface SearchHeadCoachRow {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  community_id: string;
  community_name: string;
}

/**
 * Búsqueda de Head Coaches por username y flujo de solicitud de ingreso a
 * su comunidad. Toda la escritura pasa por `request_join_community`
 * (RPC SECURITY DEFINER) — este servicio nunca inserta directamente.
 */
export class CommunityService {
  constructor(private readonly supabase: SupabaseClient) {}

  async searchHeadCoaches(query: string): Promise<HeadCoachResult[]> {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const { data, error } = await this.supabase.rpc("search_head_coaches", {
      p_query: trimmed,
    });

    if (error || !data) return [];

    return (data as SearchHeadCoachRow[]).map((row) => ({
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      communityId: row.community_id,
      communityName: row.community_name,
    }));
  }

  async requestToJoin(communityId: string): Promise<void> {
    const { error } = await this.supabase.rpc("request_join_community", {
      p_community_id: communityId,
    });

    if (!error) return;

    if (error.message.includes("already_member")) {
      throw new CommunityServiceError("Ya eres miembro de esta comunidad.");
    }
    if (error.code === "23505") {
      throw new CommunityServiceError("Ya tienes una solicitud pendiente con esta comunidad.");
    }
    throw new CommunityServiceError("No se pudo enviar la solicitud.");
  }
}
