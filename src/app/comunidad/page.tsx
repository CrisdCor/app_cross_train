import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { NotificationService } from "@/services/NotificationService";
import { CommunityService } from "@/services/CommunityService";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { CommunityMembersList } from "@/components/community/CommunityMembersList";

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  const { profile } = await requireSession();
  const supabase = await createClient();
  const notifications = await new NotificationService(supabase).list();
  const communityService = new CommunityService(supabase);
  const community = await communityService.getMyCommunity();

  const members = community
    ? await communityService.listCommunityMembers(community.communityId)
    : [];

  return (
    <div className="flex min-h-dvh flex-col">
      <TopHeader
        greetingName={profile?.greetingName ?? ""}
        unreadCount={notifications.filter((n) => !n.isRead).length}
      />

      <main className="flex flex-1 flex-col px-5 pb-24 pt-2">
        {community ? (
          <>
            <h1 className="label-heading mb-4 text-lg text-text-primary">
              {community.communityName}
            </h1>
            <CommunityMembersList members={members} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="label-heading text-sm text-text-secondary">
              Aún no perteneces a una comunidad
            </p>
            {profile?.isAthlete ? (
              <>
                <p className="max-w-[240px] text-sm text-text-muted">
                  Busca a tu Head Coach y envíale una solicitud para unirte.
                </p>
                <Link
                  href="/buscar"
                  className="mt-2 text-sm font-bold text-text-primary underline underline-offset-4"
                >
                  Buscar Head Coach
                </Link>
              </>
            ) : (
              <p className="max-w-[240px] text-sm text-text-muted">
                Esta sección aparece cuando diriges o perteneces a una comunidad.
              </p>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
