import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileService } from "@/services/ProfileService";
import { SignOutButton } from "@/components/home/SignOutButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profileService = new ProfileService(await createClient());
  const session = await profileService.getSession();

  if (!session) {
    redirect("/login");
  }

  const { profile } = session;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      {profile && (
        <div>
          <p className="label-heading text-xs text-text-muted">{profile.roleLabel}</p>
          <p className="mt-1 text-lg font-bold text-text-primary">{profile.handle}</p>
        </div>
      )}
      <div className="w-full max-w-xs">
        <SignOutButton />
      </div>
    </div>
  );
}
