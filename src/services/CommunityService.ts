import type { SupabaseClient } from "@supabase/supabase-js";

export class CommunityServiceError extends Error {}

export type CommunityRelationship = "none" | "pending" | "member";

export interface HeadCoachResult {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  communityId: string;
  communityName: string;
}

export interface HeadCoachProfile extends HeadCoachResult {
  bio: string;
  programName: string;
}

interface SearchHeadCoachRow {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  program_name: string;
  community_id: string;
  community_name: string;
}

/**
 * Búsqueda de Head Coaches, su perfil público y el flujo de solicitud de
 * ingreso a su comunidad. Toda la escritura pasa por `request_join_community`
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

    return (data as SearchHeadCoachRow[]).map(toHeadCoachResult);
  }

  async getHeadCoachProfile(username: string): Promise<HeadCoachProfile | null> {
    const { data, error } = await this.supabase.rpc("get_head_coach_profile", {
      p_username: username.toLowerCase(),
    });

    if (error || !data) return null;
    const row = (data as SearchHeadCoachRow[])[0];
    if (!row) return null;

    return {
      ...toHeadCoachResult(row),
      bio: row.bio,
      programName: row.program_name,
    };
  }

  /** Relación del usuario actual con una comunidad: ya es miembro, tiene una solicitud pendiente, o ninguna. */
  async getMyRelationship(communityId: string): Promise<CommunityRelationship> {
    const { data: membership } = await this.supabase
      .from("memberships")
      .select("status")
      .eq("community_id", communityId)
      .maybeSingle();

    if (membership?.status === "active") return "member";

    const { data: request } = await this.supabase
      .from("community_join_requests")
      .select("status")
      .eq("community_id", communityId)
      .eq("status", "pending")
      .maybeSingle();

    if (request) return "pending";

    return "none";
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

function toHeadCoachResult(row: SearchHeadCoachRow): HeadCoachResult {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    communityId: row.community_id,
    communityName: row.community_name,
  };
}
