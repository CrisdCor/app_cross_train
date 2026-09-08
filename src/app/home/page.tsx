import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { NotificationService } from "@/services/NotificationService";
import { CommunityService } from "@/services/CommunityService";
import { WorkoutService } from "@/services/WorkoutService";
import { todayIso } from "@/lib/dates";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { WorkoutFeedCard } from "@/components/home/WorkoutFeedCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { profile } = await requireSession();
  const supabase = await createClient();
  const notifications = await new NotificationService(supabase).list();
  const community = await new CommunityService(supabase).getMyCommunity();
  const workout = community
    ? await new WorkoutService(supabase).getForDate(community.communityId, todayIso())
    : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader
        greetingName={profile?.greetingName ?? ""}
        unreadCount={notifications.filter((n) => !n.isRead).length}
      />

      <main className="flex flex-1 flex-col px-5 pb-24 pt-2">
        {workout ? (
          <WorkoutFeedCard workout={workout} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="label-heading text-sm text-text-secondary">Sin programación aún</p>
            <p className="max-w-[240px] text-sm text-text-muted">
              Cuando tu Head Coach publique tu entrenamiento, lo verás aquí.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
