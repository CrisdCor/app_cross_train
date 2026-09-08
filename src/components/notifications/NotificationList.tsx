"use client";

import { useState } from "react";
import { UserPlus, UserCheck, UserX, Bell, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationService, NotificationServiceError } from "@/services/NotificationService";
import { AppNotification, type NotificationRow } from "@/domain/Notification";

interface NotificationListProps {
  initialRows: NotificationRow[];
}

function dayLabel(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  if (sameDay(date, now)) return "Hoy";
  if (sameDay(date, yesterday)) return "Ayer";
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function iconFor(notification: AppNotification) {
  if (notification.type === "join_request") return UserPlus;
  if (notification.type === "join_approved") return UserCheck;
  if (notification.type === "join_rejected") return UserX;
  return Bell;
}

export function NotificationList({ initialRows }: NotificationListProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    initialRows.map(AppNotification.fromRow)
  );
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  function replace(id: string, updater: (n: AppNotification) => AppNotification) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? updater(n) : n)));
  }

  async function handleOpen(notification: AppNotification) {
    if (notification.isRead) return;

    replace(
      notification.id,
      (n) => new AppNotification(n.id, n.type, n.title, n.body, n.data, true, n.createdAt)
    );

    const service = new NotificationService(createClient());
    await service.markRead(notification.id);
  }

  async function handleDecision(notification: AppNotification, approve: boolean) {
    const requestId = notification.requestId;
    if (!requestId) return;

    setResolvingId(notification.id);
    setErrorById((prev) => ({ ...prev, [notification.id]: "" }));
    const service = new NotificationService(createClient());

    try {
      if (approve) {
        await service.approveJoinRequest(requestId);
      } else {
        await service.rejectJoinRequest(requestId);
      }
      replace(
        notification.id,
        (n) =>
          new AppNotification(
            n.id,
            n.type,
            n.title,
            n.body,
            { ...n.data, status: approve ? "approved" : "rejected" },
            true,
            n.createdAt
          )
      );
    } catch (err) {
      const message = err instanceof NotificationServiceError ? err.message : "Algo salió mal.";
      setErrorById((prev) => ({ ...prev, [notification.id]: message }));
    } finally {
      setResolvingId(null);
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm text-text-muted">Aún no tienes notificaciones.</p>
      </div>
    );
  }

  const grouped = notifications.reduce<
    { notification: AppNotification; showDayHeading: boolean }[]
  >((acc, notification) => {
    const day = dayLabel(notification.createdAt);
    const previousDay = acc.length > 0 ? dayLabel(acc[acc.length - 1].notification.createdAt) : null;
    return [...acc, { notification, showDayHeading: day !== previousDay }];
  }, []);

  return (
    <ul className="flex flex-col pb-6">
      {grouped.map(({ notification, showDayHeading }) => {
        const day = dayLabel(notification.createdAt);
        const Icon = iconFor(notification);
        const error = errorById[notification.id];

        return (
          <li key={notification.id}>
            {showDayHeading && (
              <p className="label-heading px-5 pb-2 pt-5 text-xs text-text-muted">{day}</p>
            )}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleOpen(notification)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleOpen(notification);
              }}
              className="flex w-full items-start gap-3 px-5 py-3 text-left"
            >
              {!notification.isRead && (
                <span className="mt-2 h-2 w-2 shrink-0 bg-success" aria-hidden />
              )}
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-black">
                <Icon size={20} strokeWidth={1.5} className="text-white" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-bold text-text-primary">
                    {notification.title}
                  </span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {timeLabel(notification.createdAt)}
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-text-secondary">
                  {notification.body}
                </span>

                {notification.isPendingJoinRequest && (
                  <span className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecision(notification, true);
                      }}
                      disabled={resolvingId === notification.id}
                      className="label-heading flex items-center gap-1 border border-black bg-black px-3 py-2 text-xs text-white disabled:opacity-40"
                    >
                      <Check size={14} strokeWidth={2} /> Aceptar
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecision(notification, false);
                      }}
                      disabled={resolvingId === notification.id}
                      className="label-heading flex items-center gap-1 border border-black px-3 py-2 text-xs text-text-primary disabled:opacity-40"
                    >
                      <X size={14} strokeWidth={2} /> Rechazar
                    </button>
                  </span>
                )}

                {notification.isJoinRequest && !notification.isPendingJoinRequest && (
                  <span className="mt-2 block text-xs text-text-muted">
                    {notification.data.status === "approved"
                      ? "Aceptaste esta solicitud."
                      : "Rechazaste esta solicitud."}
                  </span>
                )}

                {error && <span className="mt-2 block text-xs text-error">{error}</span>}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
