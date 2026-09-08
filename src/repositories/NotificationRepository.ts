import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationRow } from "@/domain/Notification";

/**
 * Único punto de acceso a la tabla `notifications`. Las mutaciones (marcar
 * como leída, aprobar/rechazar) no viven aquí — pasan por RPCs que el
 * servicio invoca directamente, siguiendo el patrón de "escritura solo por
 * función" ya usado en el resto del esquema.
 */
export class NotificationRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listForCurrentUser(): Promise<NotificationRow[]> {
    const { data } = await this.supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<NotificationRow[]>();

    return data ?? [];
  }
}
