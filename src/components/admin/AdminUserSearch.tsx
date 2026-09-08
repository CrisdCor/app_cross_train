"use client";

import { useEffect, useState } from "react";
import { Search as SearchIcon, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminService, AdminServiceError, type AdminProfileResult } from "@/services/AdminService";
import { Input } from "@/components/ui/Input";

type SearchState = { query: string; results: AdminProfileResult[] };

export function AdminUserSearch() {
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [overrides, setOverrides] = useState<Record<string, "head_coach">>({});
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [errorById, setErrorById] = useState<Record<string, string>>({});

  const trimmedQuery = query.trim();
  const baseResults = searchState && searchState.query === trimmedQuery ? searchState.results : [];
  const results = baseResults.map((result) =>
    overrides[result.id] ? { ...result, role: overrides[result.id] } : result
  );
  const isSearching = trimmedQuery.length >= 2 && (!searchState || searchState.query !== trimmedQuery);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      return;
    }

    const service = new AdminService(createClient());
    const timeout = setTimeout(async () => {
      const found = await service.searchProfiles(trimmedQuery);
      setSearchState({ query: trimmedQuery, results: found });
    }, 350);

    return () => clearTimeout(timeout);
  }, [trimmedQuery]);

  async function handlePromote(result: AdminProfileResult) {
    setPromotingId(result.id);
    setErrorById((prev) => ({ ...prev, [result.id]: "" }));
    const service = new AdminService(createClient());

    try {
      await service.promoteToHeadCoach(result.id);
      setOverrides((prev) => ({ ...prev, [result.id]: "head_coach" }));
    } catch (err) {
      const message = err instanceof AdminServiceError ? err.message : "No se pudo promover.";
      setErrorById((prev) => ({ ...prev, [result.id]: message }));
    } finally {
      setPromotingId(null);
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
          placeholder="Usuario o nombre"
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
        <p className="text-sm text-text-muted">No encontramos usuarios con ese criterio.</p>
      )}

      <ul className="flex flex-col">
        {results.map((result) => {
          const error = errorById[result.id];
          return (
            <li key={result.id} className="border-b border-border py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text-primary">
                    @{result.username}
                  </p>
                  <p className="truncate text-xs text-text-muted">
                    {result.fullName || "Sin nombre"}
                  </p>
                </div>

                {result.role === "admin" && (
                  <span className="label-heading shrink-0 text-xs text-text-muted">
                    Administrador
                  </span>
                )}

                {result.role === "head_coach" && (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-success">
                    <Check size={16} strokeWidth={1.5} /> Head Coach
                  </span>
                )}

                {result.role === "athlete" && (
                  <button
                    type="button"
                    onClick={() => handlePromote(result)}
                    disabled={promotingId === result.id}
                    className="label-heading shrink-0 border border-black bg-black px-3 py-2 text-xs text-white disabled:opacity-40"
                  >
                    {promotingId === result.id ? "Promoviendo…" : "Hacer Head Coach"}
                  </button>
                )}
              </div>
              {error && <p className="mt-1 text-xs text-error">{error}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
