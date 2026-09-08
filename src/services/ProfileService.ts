import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ProfileRepository } from "@/repositories/ProfileRepository";
import type { Profile } from "@/domain/Profile";

export interface Session {
  user: User;
  profile: Profile | null;
}

/**
 * Resuelve la sesión actual (usuario de Auth + su perfil de dominio) desde
 * un Server Component. Devuelve null cuando no hay sesión — la página
 * decide si eso implica un redirect.
 */
export class ProfileService {
  private readonly repository: ProfileRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.repository = new ProfileRepository(supabase);
  }

  async getSession(): Promise<Session | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) return null;

    const profile = await this.repository.findById(user.id);
    return { user, profile };
  }
}
