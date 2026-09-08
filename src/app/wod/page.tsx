import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { NotificationService } from "@/services/NotificationService";
import { CommunityService } from "@/services/CommunityService";
import { WorkoutService } from "@/services/WorkoutService";
import { todayIso } from "@/lib/dates";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { DayTabs } from "@/components/wod/DayTabs";
import { WodSections } from "@/components/wod/WodSections";

export const dynamic = "force-dynamic";

interface WodPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function WodPage({ searchParams }: WodPageProps) {
  const { date } = await searchParams;
  const selectedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIso();

  const { profile } = await requireSession();
  const supabase = await createClient();
  const notifications = await new NotificationService(supabase).list();
  const community = await new CommunityService(supabase).getMyCommunity();
  const workout = community
    ? await new WorkoutService(supabase).getForDate(community.communityId, selectedDate)
    : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader
        greetingName={profile?.greetingName ?? ""}
        unreadCount={notifications.filter((n) => !n.isRead).length}
      />

      {!community ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-24 text-center">
          <p className="label-heading text-sm text-text-secondary">WOD próximamente</p>
          <p className="max-w-[240px] text-sm text-text-muted">
            Aquí verás el entrenamiento del día que publique tu Head Coach.
          </p>
        </main>
      ) : (
        <>
          <div className="pt-6">
            <DayTabs selectedDate={selectedDate} basePath="/wod" />
          </div>
          <main className="flex flex-1 flex-col pb-24">
            <WodSections
              workout={workout}
              programarHref={community.isOwner ? `/wod/programar?date=${selectedDate}` : undefined}
            />
          </main>
        </>
      )}

      <BottomNav />
    </div>
  );
}
