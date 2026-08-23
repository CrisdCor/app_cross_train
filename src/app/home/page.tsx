import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/ui/AppShell";
import { BottomNav } from "@/components/ui/BottomNav";
import { HomeWeekView } from "@/components/home/HomeWeekView";
import { JoinCommunityCard } from "@/components/home/JoinCommunityCard";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  head_coach: "Head Coach",
  coach: "Coach",
  user: "Atleta",
};

export default async function HomePage() {
  const { user, profile } = await getSessionProfile();

  const firstName = profile?.first_name || user.email?.split("@")[0] || "Atleta";
  const roleLabel = ROLE_LABEL[profile?.role ?? "user"];

  let hasMembership = true;
  if (profile?.role === "user") {
    const supabase = await createClient();
    const { count } = await supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "active");

    hasMembership = (count ?? 0) > 0;

    const isIncomplete = !profile.first_name || !profile.last_name || !profile.document_id;
    if (hasMembership && isIncomplete) {
      redirect("/complete-profile");
    }
  }

  return (
    <AppShell withBottomNavPadding>
      <header className="flex items-center justify-between px-5 pt-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            {roleLabel}
          </p>
          <h1 className="font-display text-xl uppercase tracking-wide text-text-primary">
            Hola, {firstName}
          </h1>
        </div>
        <div className="h-11 w-11 overflow-hidden rounded-full border border-border bg-surface-2">
          {profile?.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={firstName}
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </header>

      {profile?.role === "user" && !hasMembership ? (
        <JoinCommunityCard />
      ) : (
        <HomeWeekView />
      )}

      <BottomNav role={profile?.role} />
    </AppShell>
  );
}
