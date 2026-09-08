"use client";

import { useState } from "react";
import Image from "next/image";
import { Search as SearchIcon } from "lucide-react";
import type { CommunityMember } from "@/services/CommunityService";
import { Input } from "@/components/ui/Input";

interface CommunityMembersListProps {
  members: CommunityMember[];
}

export function CommunityMembersList({ members }: CommunityMembersListProps) {
  const [query, setQuery] = useState("");

  const normalized = query.trim().toLowerCase();
  const filtered = normalized
    ? members.filter(
        (member) =>
          member.username.toLowerCase().includes(normalized) ||
          member.fullName.toLowerCase().includes(normalized)
      )
    : members;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchIcon
          size={18}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <Input
          placeholder="Buscar por nombre o usuario"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-text-muted">
          {members.length === 0 ? "Aún no hay miembros activos." : "Nadie coincide con esa búsqueda."}
        </p>
      )}

      <ul className="flex flex-col">
        {filtered.map((member) => (
          <li key={member.id} className="flex items-center gap-3 border-b border-border py-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden bg-black text-xs font-bold text-white">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt=""
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                (member.fullName.trim() || member.username).slice(0, 2).toUpperCase()
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-text-primary">
                @{member.username}
              </span>
              {member.fullName.trim() && (
                <span className="block truncate text-xs text-text-muted">{member.fullName}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
