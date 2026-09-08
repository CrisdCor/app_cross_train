import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { NotificationService } from "@/services/NotificationService";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";

export const dynamic = "force-dynamic";

export default async function WodPage() {
  const { profile } = await requireSession();
  const supabase = await createClient();
  const notifications = await new NotificationService(supabase).list();

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader
        greetingName={profile?.greetingName ?? ""}
        hasUnreadNotifications={notifications.some((n) => !n.isRead)}
      />

      <main className="flex flex-1 flex-col px-5 pb-24 pt-2">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="label-heading text-sm text-text-secondary">WOD próximamente</p>
          <p className="max-w-[240px] text-sm text-text-muted">
            Aquí verás el entrenamiento del día que publique tu Head Coach.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
