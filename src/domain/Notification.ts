export type NotificationType = "join_request" | "join_approved" | "join_rejected" | "system";

export interface NotificationRow {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

/**
 * Entidad de dominio de una notificación. Encapsula la lectura del `data`
 * jsonb (payload variable según el tipo) detrás de getters con nombre, para
 * que la UI nunca acceda a `data["algo"]` directamente.
 */
export class AppNotification {
  constructor(
    public readonly id: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly body: string,
    public readonly data: Record<string, unknown>,
    public readonly isRead: boolean,
    public readonly createdAt: string
  ) {}

  static fromRow(row: NotificationRow): AppNotification {
    return new AppNotification(
      row.id,
      row.type as NotificationType,
      row.title,
      row.body,
      row.data ?? {},
      Boolean(row.read_at),
      row.created_at
    );
  }

  get isJoinRequest(): boolean {
    return this.type === "join_request";
  }

  get isPendingJoinRequest(): boolean {
    return this.isJoinRequest && this.data.status === "pending";
  }

  get requestId(): string | null {
    return typeof this.data.request_id === "string" ? this.data.request_id : null;
  }

  get athleteUsername(): string | null {
    return typeof this.data.athlete_username === "string"
      ? (this.data.athlete_username as string)
      : null;
  }
}
