import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { CompleteProfileForm } from "@/components/profile/CompleteProfileForm";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage() {
  const { user, profile } = await requireSession();

  if (!profile || !profile.isHeadCoach) {
    redirect("/perfil");
  }

  const [firstName, ...rest] = profile.fullName.trim().split(/\s+/).filter(Boolean);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <Link href="/perfil" aria-label="Volver">
          <ChevronLeft size={22} strokeWidth={1.5} className="text-text-primary" />
        </Link>
        <h1 className="label-heading text-lg text-text-primary">Completar perfil</h1>
      </header>
      <div className="h-px bg-border" />

      <main className="flex-1 px-5 pb-10 pt-6">
        <CompleteProfileForm
          userId={user.id}
          initialFirstName={firstName ?? ""}
          initialLastName={rest.join(" ")}
          initialBio={profile.bio}
          initialProgramName={profile.programName}
          initialAvatarUrl={profile.avatarUrl}
          initials={profile.initials}
        />
      </main>
    </div>
  );
}
