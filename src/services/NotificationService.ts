import type { SupabaseClient } from "@supabase/supabase-js";
import { NotificationRepository } from "@/repositories/NotificationRepository";
import { AppNotification } from "@/domain/Notification";

export class NotificationServiceError extends Error {}

/**
 * Lógica de negocio de la bandeja de notificaciones: listar, marcar como
 * leída y resolver (aprobar/rechazar) una solicitud de ingreso a comunidad
 * directamente desde su notificación.
 */
export class NotificationService {
  private readonly repository: NotificationRepository;

  constructor(private readonly supabase: SupabaseClient) {
    this.repository = new NotificationRepository(supabase);
  }

  async list(): Promise<AppNotification[]> {
    const rows = await this.repository.listForCurrentUser();
    return rows.map(AppNotification.fromRow);
  }

  static hasUnread(notifications: AppNotification[]): boolean {
    return notifications.some((n) => !n.isRead);
  }

  async markRead(notificationId: string): Promise<void> {
    await this.supabase.rpc("mark_notification_read", { p_notification_id: notificationId });
  }

  async approveJoinRequest(requestId: string): Promise<void> {
    const { error } = await this.supabase.rpc("approve_join_request", {
      p_request_id: requestId,
    });
    if (error) {
      throw new NotificationServiceError("No se pudo aceptar la solicitud.");
    }
  }

  async rejectJoinRequest(requestId: string): Promise<void> {
    const { error } = await this.supabase.rpc("reject_join_request", {
      p_request_id: requestId,
    });
    if (error) {
      throw new NotificationServiceError("No se pudo rechazar la solicitud.");
    }
  }
}
