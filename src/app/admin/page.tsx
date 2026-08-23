import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/ui/AppShell";
import { BottomNav } from "@/components/ui/BottomNav";
import { RoleCodesPanel } from "@/components/admin/RoleCodesPanel";
import type { RoleInviteCode } from "@/lib/types";

export default async function AdminPage() {
  const { profile } = await getSessionProfile();

  if (profile?.role !== "admin") {
    redirect("/home");
  }

  const supabase = await createClient();

  const { data: roleCodes } = await supabase
    .from("role_invite_codes")
    .select("*")
    .eq("target_role", "head_coach")
    .order("created_at", { ascending: false })
    .returns<RoleInviteCode[]>();

  return (
    <AppShell withBottomNavPadding>
      <header className="px-5 pt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Administrador
        </p>
        <h1 className="font-display text-xl uppercase tracking-wide text-text-primary">
          Panel de administración
        </h1>
      </header>

      <div className="mt-6 flex flex-col gap-6 px-5">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Códigos para nuevos Head Coach
          </h2>
          <RoleCodesPanel initialCodes={roleCodes ?? []} />
        </section>
      </div>

      <BottomNav role={profile?.role} />
    </AppShell>
  );
}
