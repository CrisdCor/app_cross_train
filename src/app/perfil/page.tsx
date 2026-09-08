import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { requireSession } from "@/lib/session";
import { SignOutButton } from "@/components/home/SignOutButton";
import { LinkButton } from "@/components/ui/LinkButton";

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
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-black text-lg font-bold text-white">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.initials
              )}
            </div>
            <div>
              <p className="label-heading text-xs text-text-muted">{profile.roleLabel}</p>
              <p className="mt-1 text-lg font-bold text-text-primary">{profile.handle}</p>
            </div>
          </div>
        )}

        {profile?.isHeadCoach && (
          <div className="mt-6">
            <LinkButton
              href="/perfil/completar"
              variant={profile.isProfileComplete ? "outline" : "primary"}
            >
              {profile.isProfileComplete ? "Editar perfil" : "Completar perfil"}
            </LinkButton>
            {!profile.isProfileComplete && (
              <p className="mt-2 text-xs text-text-muted">
                Tus atletas verán tu perfil público solo cuando lo completes.
              </p>
            )}
          </div>
        )}

        {profile?.isAdmin && (
          <div className="mt-6">
            <LinkButton href="/admin" variant="outline">
              <ShieldCheck size={16} strokeWidth={1.5} />
              Panel de administrador
            </LinkButton>
          </div>
        )}

        <div className="mt-10">
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
