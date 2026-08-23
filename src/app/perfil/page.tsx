import { getSessionProfile } from "@/lib/supabase/profile";
import { AppShell } from "@/components/ui/AppShell";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";
import { SignOutButton } from "@/components/perfil/SignOutButton";

export default async function PerfilPage() {
  const { user, profile } = await getSessionProfile();

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
        {profile?.whatsapp && (
          <Card>
            <p className="text-xs uppercase tracking-wide text-text-muted">WhatsApp</p>
            <p className="mt-1 text-sm text-text-secondary">{profile.whatsapp}</p>
          </Card>
        )}

        <SignOutButton />
      </div>

      <BottomNav role={profile?.role} />
    </AppShell>
  );
}
