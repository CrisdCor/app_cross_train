import { getSessionProfile } from "@/lib/supabase/profile";
import { AppShell } from "@/components/ui/AppShell";
import { BottomNav } from "@/components/ui/BottomNav";
import { HomeWeekView } from "@/components/home/HomeWeekView";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  head_coach: "Head Coach",
  coach: "Coach",
  user: "Atleta",
};

export default async function HomePage() {
  const { user, profile } = await getSessionProfile();

  const firstName = profile?.first_name ?? user.email?.split("@")[0] ?? "Atleta";
  const roleLabel = ROLE_LABEL[profile?.role ?? "user"];

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

      <HomeWeekView />

      <BottomNav role={profile?.role} />
    </AppShell>
  );
}
