import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { CommunityService } from "@/services/CommunityService";
import { WorkoutService } from "@/services/WorkoutService";
import { todayIso, maxProgramDate } from "@/lib/dates";
import { DayTabs } from "@/components/wod/DayTabs";
import { DateJumpPicker } from "@/components/wod/DateJumpPicker";
import { ProgramWorkoutForm } from "@/components/wod/ProgramWorkoutForm";

export const dynamic = "force-dynamic";

interface ProgramWorkoutPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function ProgramWorkoutPage({ searchParams }: ProgramWorkoutPageProps) {
  const { date } = await searchParams;
  const requestedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIso();
  // El Head Coach puede programar como máximo hasta un mes por delante;
  // más allá de eso se ancla al último día programable.
  const selectedDate = requestedDate > maxProgramDate() ? maxProgramDate() : requestedDate;

  const { profile } = await requireSession();
  if (!profile || !profile.isHeadCoach) {
    redirect("/wod");
  }

  const supabase = await createClient();
  const community = await new CommunityService(supabase).getMyCommunity();

  if (!community || !community.isOwner) {
    redirect("/wod");
  }

  const workout = await new WorkoutService(supabase).getForDate(community.communityId, selectedDate);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-3 px-5 pb-4 pt-6">
        <Link href={`/wod?date=${selectedDate}`} aria-label="Volver">
          <ChevronLeft size={22} strokeWidth={1.5} className="text-text-primary" />
        </Link>
        <h1 className="label-heading text-lg text-text-primary">Programar</h1>
      </header>
      <div className="h-px bg-border" />

      <div className="pt-4">
        <DayTabs selectedDate={selectedDate} basePath="/wod/programar" />
      </div>
      <DateJumpPicker selectedDate={selectedDate} basePath="/wod/programar" />

      <main className="flex-1 px-5 pb-16">
        <ProgramWorkoutForm
          key={selectedDate}
          communityId={community.communityId}
          workoutDate={selectedDate}
          initialBlocks={workout?.blocks ?? []}
        />
      </main>
    </div>
  );
}
