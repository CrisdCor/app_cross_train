import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { AdminUserSearch } from "@/components/admin/AdminUserSearch";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { profile } = await requireSession();

  if (!profile || !profile.isAdmin) {
    redirect("/home");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <Link href="/perfil" aria-label="Volver">
          <ChevronLeft size={22} strokeWidth={1.5} className="text-text-primary" />
        </Link>
        <h1 className="label-heading text-lg text-text-primary">Administrador</h1>
      </header>
      <div className="h-px bg-border" />

      <main className="flex-1 px-5 pb-10 pt-6">
        <p className="mb-4 text-sm text-text-secondary">
          Busca un usuario y promuévelo a Head Coach.
        </p>
        <AdminUserSearch />
      </main>
    </div>
  );
}
