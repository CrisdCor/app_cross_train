"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CommunityService, CommunityServiceError, type CommunityRelationship } from "@/services/CommunityService";
import { Button } from "@/components/ui/Button";

interface JoinCommunityButtonProps {
  communityId: string;
  initialRelationship: CommunityRelationship;
}

export function JoinCommunityButton({ communityId, initialRelationship }: JoinCommunityButtonProps) {
  const [relationship, setRelationship] = useState(initialRelationship);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    const service = new CommunityService(createClient());

    try {
      await service.requestToJoin(communityId);
      setRelationship("pending");
    } catch (err) {
      setError(err instanceof CommunityServiceError ? err.message : "No se pudo enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  if (relationship === "member") {
    return (
      <p className="label-heading flex items-center justify-center gap-2 text-sm text-success">
        <Check size={16} strokeWidth={1.5} /> Ya eres parte de esta comunidad
      </p>
    );
  }

  if (relationship === "pending") {
    return (
      <p className="label-heading text-center text-sm text-text-muted">Solicitud enviada</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? "Enviando…" : "Solicitar unirme"}
      </Button>
      {error && (
        <p className="text-center text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
