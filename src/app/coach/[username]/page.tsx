import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/session";
import { CommunityService } from "@/services/CommunityService";
import { JoinCommunityButton } from "@/components/search/JoinCommunityButton";

export const dynamic = "force-dynamic";

interface CoachProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function CoachProfilePage({ params }: CoachProfilePageProps) {
  await requireSession();
  const { username } = await params;

  const supabase = await createClient();
  const communityService = new CommunityService(supabase);
  const coach = await communityService.getHeadCoachProfile(username);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center px-5 pb-2 pt-6">
        <Link href="/buscar" aria-label="Volver">
          <ChevronLeft size={22} strokeWidth={1.5} className="text-text-primary" />
        </Link>
      </header>

      {!coach ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
          <p className="text-sm text-text-muted">No encontramos ese Head Coach.</p>
        </main>
      ) : (
        <main className="flex flex-1 flex-col items-center px-6 pb-10 pt-4 text-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden bg-black text-xl font-bold text-white">
            {coach.avatarUrl ? (
              <Image
                src={coach.avatarUrl}
                alt=""
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              (coach.fullName.trim() || coach.username).slice(0, 2).toUpperCase()
            )}
          </div>

          <p className="mt-4 text-lg font-bold text-text-primary">@{coach.username}</p>
          {coach.fullName.trim() && (
            <p className="mt-1 text-sm text-text-secondary">{coach.fullName}</p>
          )}

          {coach.programName.trim() && (
            <p className="label-heading mt-4 border border-black px-3 py-1.5 text-xs text-text-primary">
              {coach.programName}
            </p>
          )}

          {coach.bio.trim() && (
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-text-secondary">
              {coach.bio}
            </p>
          )}

          <div className="mt-8 w-full max-w-xs">
            <RelationshipGate communityId={coach.communityId} />
          </div>
        </main>
      )}
    </div>
  );
}

async function RelationshipGate({ communityId }: { communityId: string }) {
  const supabase = await createClient();
  const relationship = await new CommunityService(supabase).getMyRelationship(communityId);

  return <JoinCommunityButton communityId={communityId} initialRelationship={relationship} />;
}
