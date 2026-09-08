import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ProfileRepository, type ProfileUpdateInput } from "@/repositories/ProfileRepository";
import type { Profile } from "@/domain/Profile";

export interface Session {
  user: User;
  profile: Profile | null;
}

const AVATARS_BUCKET = "avatars";

/**
 * Resuelve la sesión actual (usuario de Auth + su perfil de dominio) y
 * encapsula la edición del propio perfil, incluida la foto (Supabase
 * Storage, bucket `avatars`, carpeta = el propio user id).
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

  async updateProfile(userId: string, input: ProfileUpdateInput): Promise<Profile | null> {
    return this.repository.updateOwnProfile(userId, input);
  }

  /** Sube la foto y devuelve su URL pública; no actualiza `profiles` por sí sola. */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const extension = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar.${extension}`;

    const { error } = await this.supabase.storage
      .from(AVATARS_BUCKET)
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (error) {
      throw new Error("No se pudo subir la foto.");
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);

    // Evita servir una versión cacheada de la foto anterior con el mismo nombre.
    return `${publicUrl}?v=${Date.now()}`;
  }
}
