import { getSessionProfile } from "@/lib/supabase/profile";
import { AppShell } from "@/components/ui/AppShell";
import { BottomNav } from "@/components/ui/BottomNav";
import { Card } from "@/components/ui/Card";

export default async function WorkoutPage() {
  const { profile } = await getSessionProfile();

  return (
    <AppShell withBottomNavPadding>
      <header className="px-5 pt-6">
        <h1 className="font-display text-xl uppercase tracking-wide text-text-primary">
          Workout
        </h1>
      </header>
      <div className="mt-6 px-5">
        <Card>
          <p className="text-sm text-text-secondary">
            Aquí vivirá el detalle de cada bloque de la sesión (movilidad, calentamiento,
            fuerza/habilidad, WOD y accesorios). Lo construimos en la siguiente fase.
          </p>
        </Card>
      </div>
      <BottomNav role={profile?.role} />
    </AppShell>
  );
}
