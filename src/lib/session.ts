import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileService, type Session } from "@/services/ProfileService";

/** Resuelve la sesión actual o redirige a /login. Uso en Server Components. */
export async function requireSession(): Promise<Session> {
  const profileService = new ProfileService(await createClient());
  const session = await profileService.getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
