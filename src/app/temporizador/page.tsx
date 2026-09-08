import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { NotificationService } from "@/services/NotificationService";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";

export const dynamic = "force-dynamic";

export default async function TimerPage() {
  const { profile } = await requireSession();
  const supabase = await createClient();
  const notifications = await new NotificationService(supabase).list();

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader
        greetingName={profile?.greetingName ?? ""}
        unreadCount={notifications.filter((n) => !n.isRead).length}
      />

      <main className="flex flex-1 flex-col px-5 pb-24 pt-2">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="label-heading text-sm text-text-secondary">Cronómetro próximamente</p>
          <p className="max-w-[240px] text-sm text-text-muted">
            Temporizadores para tus WODs: AMRAP, EMOM, Tabata y por rondas.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
