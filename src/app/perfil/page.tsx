import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/ui/AppShell";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { SignOutButton } from "@/components/perfil/SignOutButton";
import type { Profile } from "@/lib/types";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return (
    <AppShell withBottomNavPadding>
      <header className="px-5 pt-6">
        <h1 className="font-display text-xl uppercase tracking-wide text-text-primary">
          Perfil
        </h1>
      </header>

      <div className="mt-6 flex flex-col gap-3 px-5">
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-muted">Nombre</p>
          <p className="mt-1 font-body text-base font-bold text-text-primary">
            {profile ? `${profile.first_name} ${profile.last_name}` : user.email}
          </p>
          {profile?.alias && (
            <p className="mt-1 text-sm text-text-secondary">@{profile.alias}</p>
          )}
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-text-muted">Correo</p>
          <p className="mt-1 text-sm text-text-secondary">{user.email}</p>
        </Card>

        <SignOutButton />
      </div>

      <BottomNav />
    </AppShell>
  );
}
