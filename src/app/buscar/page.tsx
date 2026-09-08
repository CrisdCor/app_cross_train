import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { NotificationService } from "@/services/NotificationService";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { HeadCoachSearch } from "@/components/search/HeadCoachSearch";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const { profile } = await requireSession();
  const supabase = await createClient();
  const notifications = await new NotificationService(supabase).list();

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader
        greetingName={profile?.greetingName ?? ""}
        hasUnreadNotifications={notifications.some((n) => !n.isRead)}
      />

      <main className="flex-1 px-5 pb-24 pt-2">
        <h1 className="label-heading mb-4 text-lg text-text-primary">Buscar comunidad</h1>
        <HeadCoachSearch />
      </main>

      <BottomNav />
    </div>
  );
}
