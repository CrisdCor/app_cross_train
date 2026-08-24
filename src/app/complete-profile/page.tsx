import { getSessionProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/ui/AppShell";
import { CompleteProfileForm } from "@/components/complete-profile/CompleteProfileForm";
import type { Community } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage() {
  const { user, profile } = await getSessionProfile();

  let community: Community | null = null;
  if (profile?.role === "head_coach") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("communities")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle<Community>();
    community = data;
  }

  const subtitle =
    profile?.role === "head_coach"
      ? "Termina de configurar tu perfil de coach"
      : "Ya estás dentro de tu comunidad, cuéntanos quién eres";

  return (
    <AppShell>
      <div className="px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl uppercase tracking-wide text-text-primary">
            Completa tu perfil
          </h1>
          <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
        </div>

        <CompleteProfileForm
          userId={user.id}
          profile={profile}
          communityLogoUrl={community?.logo_url ?? null}
        />
      </div>
    </AppShell>
  );
}
