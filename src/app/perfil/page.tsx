import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireSession } from "@/lib/session";
import { SignOutButton } from "@/components/home/SignOutButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { profile } = await requireSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <Link href="/home" aria-label="Volver">
          <ChevronLeft size={22} strokeWidth={1.5} className="text-text-primary" />
        </Link>
        <h1 className="label-heading text-lg text-text-primary">Perfil</h1>
      </header>
      <div className="h-px bg-border" />

      <main className="flex flex-1 flex-col px-5 pt-8">
        {profile && (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-black text-lg font-bold text-white">
              {profile.initials}
            </div>
            <div>
              <p className="label-heading text-xs text-text-muted">{profile.roleLabel}</p>
              <p className="mt-1 text-lg font-bold text-text-primary">{profile.handle}</p>
            </div>
          </div>
        )}

        <div className="mt-10">
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
