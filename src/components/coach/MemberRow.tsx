"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Card } from "@/components/ui/Card";
import { toggleMembershipStatus } from "@/app/coach/actions";
import type { MembershipWithProfile } from "@/lib/types";

export function MemberRow({ membership }: { membership: MembershipWithProfile }) {
  const router = useRouter();
  const [status, setStatus] = useState(membership.status);
  const [isPending, startTransition] = useTransition();

  const profile = membership.profile;
  const name = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || profile.email
    : "Atleta";
  const isActive = status === "active";

  function handleToggle() {
    const next = isActive ? "inactive" : "active";
    setStatus(next);
    startTransition(async () => {
      const result = await toggleMembershipStatus(membership.id, next);
      if (result.error) {
        setStatus(isActive ? "active" : "inactive"); // revertir
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate font-body text-sm font-bold text-text-primary">
          {name}
        </p>
        {profile?.alias && (
          <p className="truncate text-xs text-text-muted">@{profile.alias}</p>
        )}
        {profile?.email && (
          <p className="truncate text-xs text-text-secondary">{profile.email}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={clsx(
          "flex shrink-0 items-center gap-2 rounded-control border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-50",
          isActive
            ? "border-accent-lime/40 text-accent-lime"
            : "border-accent-orange/40 text-accent-orange"
        )}
      >
        <span
          className={clsx(
            "h-2 w-2 rounded-full",
            isActive ? "bg-accent-lime" : "bg-accent-orange"
          )}
        />
        {isActive ? "Activo" : "Inactivo"}
      </button>
    </Card>
  );
}
