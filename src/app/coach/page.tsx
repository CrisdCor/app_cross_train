import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/ui/AppShell";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { InviteCodesPanel } from "@/components/coach/InviteCodesPanel";
import { MemberRow } from "@/components/coach/MemberRow";
import type { Community, InviteCode, MembershipWithProfile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const { user, profile } = await getSessionProfile();

  if (profile?.role !== "head_coach") {
    redirect("/home");
  }

  const supabase = await createClient();

  const { data: community } = await supabase
    .from("communities")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle<Community>();

  if (!community) {
    return (
      <AppShell withBottomNavPadding>
        <header className="px-5 pt-6">
          <h1 className="font-display text-xl uppercase tracking-wide text-text-primary">
            Coach
          </h1>
        </header>
        <div className="mt-6 px-5">
          <Card>
            <p className="text-sm text-text-secondary">
              Todavía no tienes una comunidad creada. Esto debería pasar solo — si
              ves este mensaje, cuéntale a soporte.
            </p>
          </Card>
        </div>
        <BottomNav role={profile?.role} />
      </AppShell>
    );
  }

  const [{ data: members }, { data: inviteCodes }] = await Promise.all([
    supabase
      .from("memberships")
      .select(
        "*, profile:profiles(id,first_name,last_name,alias,email,avatar_url)"
      )
      .eq("community_id", community.id)
      .order("joined_at", { ascending: false })
      .returns<MembershipWithProfile[]>(),
    supabase
      .from("invite_codes")
      .select("*")
      .eq("community_id", community.id)
      .order("created_at", { ascending: false })
      .returns<InviteCode[]>(),
  ]);

  return (
    <AppShell withBottomNavPadding>
      <header className="px-5 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Head Coach
        </p>
        <h1 className="font-display text-xl uppercase tracking-wide text-text-primary">
          {community.name}
        </h1>
      </header>

      <div className="mt-6 flex flex-col gap-6 px-5">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Invitar atletas
          </h2>
          <InviteCodesPanel
            communityId={community.id}
            initialCodes={inviteCodes ?? []}
          />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Tu comunidad ({members?.length ?? 0})
          </h2>
          <div className="flex flex-col gap-2">
            {members && members.length > 0 ? (
              members.map((member) => (
                <MemberRow key={member.id} membership={member} />
              ))
            ) : (
              <Card>
                <p className="text-sm text-text-secondary">
                  Todavía no tienes atletas. Comparte un código de invitación para
                  que se unan.
                </p>
              </Card>
            )}
          </div>
        </section>
      </div>

      <BottomNav role={profile?.role} />
    </AppShell>
  );
}
