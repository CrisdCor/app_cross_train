import Link from "next/link";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { NotificationRepository } from "@/repositories/NotificationRepository";
import { NotificationList } from "@/components/notifications/NotificationList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireSession();
  const supabase = await createClient();
  const rows = await new NotificationRepository(supabase).listForCurrentUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 pb-4 pt-6">
        <h1 className="label-heading text-lg text-text-primary">Bandeja de entrada</h1>
        <Link href="/home" aria-label="Cerrar">
          <X size={22} strokeWidth={1.5} className="text-text-primary" />
        </Link>
      </header>
      <div className="h-px bg-border" />

      <main className="flex flex-1 flex-col">
        <NotificationList initialRows={rows} />
      </main>
    </div>
  );
}
