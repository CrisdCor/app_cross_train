import type { SupabaseClient } from "@supabase/supabase-js";

export interface SignUpParams {
  email: string;
  password: string;
  username: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export class AuthError extends Error {}

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

/**
 * Encapsula todo el flujo de autenticación contra Supabase. Las pantallas
 * de login/signup no hablan con `supabase.auth` directamente — hablan con
 * este servicio, que valida y traduce errores a mensajes de usuario.
 */
export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  static normalizeUsername(raw: string): string {
    return raw.trim().toLowerCase();
  }

  static isUsernameFormatValid(username: string): boolean {
    return USERNAME_PATTERN.test(username);
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc("is_username_available", {
      p_username: username,
    });

    if (error) return false;
    return Boolean(data);
  }

  async signUp({ email, password, username }: SignUpParams): Promise<void> {
    const normalized = AuthService.normalizeUsername(username);

    if (!AuthService.isUsernameFormatValid(normalized)) {
      throw new AuthError(
        "El usuario debe tener entre 3 y 30 caracteres: minúsculas, números, puntos o guiones bajos."
      );
    }

    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { username: normalized } },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        throw new AuthError("Ese correo ya tiene una cuenta.");
      }
      throw new AuthError(error.message);
    }
  }

  async signIn({ email, password }: SignInParams): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new AuthError("Correo o contraseña incorrectos.");
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
