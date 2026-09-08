"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CommunityService, CommunityServiceError, type HeadCoachResult } from "@/services/CommunityService";
import { Input } from "@/components/ui/Input";

type SearchState = { query: string; results: HeadCoachResult[] };

export function HeadCoachSearch() {
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [errorByCommunity, setErrorByCommunity] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

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

  async function handleRequest(result: HeadCoachResult) {
    setSendingId(result.communityId);
    setErrorByCommunity((prev) => ({ ...prev, [result.communityId]: "" }));

    const service = new CommunityService(createClient());

    try {
      await service.requestToJoin(result.communityId);
      setRequestedIds((prev) => new Set(prev).add(result.communityId));
    } catch (err) {
      const message =
        err instanceof CommunityServiceError ? err.message : "No se pudo enviar la solicitud.";
      setErrorByCommunity((prev) => ({ ...prev, [result.communityId]: message }));
    } finally {
      setSendingId(null);
    }
  }

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

      <ul className="flex flex-col gap-3">
        {results.map((result) => {
          const alreadyRequested = requestedIds.has(result.communityId);
          const error = errorByCommunity[result.communityId];

          return (
            <li
              key={result.id}
              className="flex items-center justify-between gap-3 border border-border px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-text-primary">@{result.username}</p>
                <p className="truncate text-xs text-text-muted">{result.communityName}</p>
                {error && <p className="mt-1 text-xs text-error">{error}</p>}
              </div>
              {alreadyRequested ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-success">
                  <Check size={16} strokeWidth={1.75} />
                  Enviada
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleRequest(result)}
                  disabled={sendingId === result.communityId}
                  className="label-heading shrink-0 border border-black px-3 py-2 text-xs disabled:opacity-40"
                >
                  {sendingId === result.communityId ? "Enviando…" : "Solicitar"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
