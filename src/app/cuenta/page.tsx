import Link from "next/link";
import { Settings, X, User, UserStar, ArrowRight, CreditCard } from "lucide-react";
import { requireSession } from "@/lib/session";
import { SignOutButton } from "@/components/home/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AccountMenuPage() {
  const { profile } = await requireSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-5 pb-4 pt-6">
        <h1 className="label-heading text-lg text-text-primary">
          {(profile?.greetingName ?? "").toUpperCase()}
        </h1>
        <div className="flex items-center gap-4">
          <Settings size={20} strokeWidth={1.5} className="text-text-primary" />
          <Link href="/home" aria-label="Cerrar">
            <X size={22} strokeWidth={1.5} className="text-text-primary" />
          </Link>
        </div>
      </header>
      <div className="h-px bg-border" />

      <main className="flex-1 px-5 py-5">
        {profile && !profile.isProfileComplete && (
          <div className="mb-6 border border-border p-4">
            <UserStar size={22} strokeWidth={1.5} className="text-text-primary" />
            <p className="mt-3 text-sm font-bold text-text-primary">Completa tu perfil</p>
            <p className="mt-1 text-xs text-text-secondary">
              {profile.isHeadCoach
                ? "Así tus atletas podrán conocerte y encontrar tu programación."
                : "Así tu comunidad podrá conocerte mejor."}
            </p>
            <Link
              href="/perfil/completar"
              className="label-heading mt-4 inline-flex items-center gap-2 text-xs text-text-primary"
            >
              Completar
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link href="/perfil" className="border border-border p-4">
            <User size={20} strokeWidth={1.5} className="text-text-primary" />
            <p className="label-heading mt-3 text-xs text-text-primary">Mi perfil</p>
            <p className="mt-1 text-xs text-text-muted">
              Administra tus datos y la configuración de tu cuenta
            </p>
          </Link>
          <div className="border border-border p-4">
            <CreditCard size={20} strokeWidth={1.5} className="text-text-muted" />
            <p className="label-heading mt-3 text-xs text-text-primary">Planes</p>
            <p className="mt-1 text-xs text-text-muted">Próximamente</p>
          </div>
        </div>

        <div className="mt-8">
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
