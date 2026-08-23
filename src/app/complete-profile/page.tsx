import { getSessionProfile } from "@/lib/supabase/profile";
import { AppShell } from "@/components/ui/AppShell";
import { CompleteProfileForm } from "@/components/complete-profile/CompleteProfileForm";

export default async function CompleteProfilePage() {
  const { user, profile } = await getSessionProfile();

  return (
    <AppShell>
      <div className="px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl uppercase tracking-wide text-text-primary">
            Completa tu perfil
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Ya estás dentro de tu comunidad, cuéntanos quién eres
          </p>
        </div>

        <CompleteProfileForm userId={user.id} profile={profile} />
      </div>
    </AppShell>
  );
}
