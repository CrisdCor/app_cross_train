"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CommunityService, type HeadCoachResult } from "@/services/CommunityService";
import { Input } from "@/components/ui/Input";

type SearchState = { query: string; results: HeadCoachResult[] };

export function HeadCoachSearch() {
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState | null>(null);

  const trimmedQuery = query.trim();

  // Estado derivado en render: solo el efecto dispara la búsqueda async y
  // guarda su resultado; nunca hace setState de forma síncrona en su cuerpo.
  const results = searchState && searchState.query === trimmedQuery ? searchState.results : [];
  const isSearching = trimmedQuery.length >= 2 && (!searchState || searchState.query !== trimmedQuery);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      return;
    }

    const service = new CommunityService(createClient());
    const timeout = setTimeout(async () => {
      const found = await service.searchHeadCoaches(trimmedQuery);
      setSearchState({ query: trimmedQuery, results: found });
    }, 350);

    return () => clearTimeout(timeout);
  }, [trimmedQuery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchIcon
          size={18}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <Input
          placeholder="Usuario del Head Coach"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      {trimmedQuery.length > 0 && trimmedQuery.length < 2 && (
        <p className="text-sm text-text-muted">Escribe al menos 2 caracteres.</p>
      )}

      {isSearching && <p className="text-sm text-text-muted">Buscando…</p>}

      {!isSearching && trimmedQuery.length >= 2 && results.length === 0 && (
        <p className="text-sm text-text-muted">No encontramos un Head Coach con ese usuario.</p>
      )}

      <ul className="flex flex-col">
        {results.map((result) => (
          <li key={result.id} className="border-b border-border">
            <Link
              href={`/coach/${result.username}`}
              className="flex items-center gap-3 py-3 active:opacity-70"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden bg-black text-xs font-bold text-white">
                {result.avatarUrl ? (
                  <Image
                    src={result.avatarUrl}
                    alt=""
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (result.fullName.trim() || result.username).slice(0, 2).toUpperCase()
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-text-primary">
                  @{result.username}
                </span>
                <span className="block truncate text-xs text-text-muted">
                  {result.communityName}
                </span>
              </span>
              <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
