"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { generateInviteCode } from "@/app/coach/actions";
import type { InviteCode } from "@/lib/types";

export function InviteCodesPanel({
  communityId,
  initialCodes,
}: {
  communityId: string;
  initialCodes: InviteCode[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // initialCodes viene del server component; router.refresh() tras generar/copiar
  // vuelve a renderizar este componente con la lista actualizada como prop.
  const codes = initialCodes;

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateInviteCode(communityId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 1800);
    } catch {
      // portapapeles no disponible; el usuario puede copiarlo manualmente
    }
  }

  const activeCodes = codes.filter((c) => c.uses_count < c.max_uses);

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleGenerate}
        disabled={isPending}
      >
        <Plus size={18} />
        {isPending ? "Generando…" : "Generar código de invitación"}
      </Button>

      {error && (
        <p className="text-sm text-accent-orange" role="alert">
          {error}
        </p>
      )}

      {activeCodes.length > 0 && (
        <div className="flex flex-col gap-2">
          {activeCodes.map((invite) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="flex items-center justify-between py-3">
                <div>
                  <p className="font-mono text-lg font-bold tracking-[0.2em] text-accent-lime">
                    {invite.code}
                  </p>
                  <p className="text-xs text-text-muted">
                    {invite.uses_count}/{invite.max_uses} usos
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(invite.code)}
                  className="flex h-9 w-9 items-center justify-center rounded-control border border-border text-text-secondary"
                  aria-label="Copiar código"
                >
                  {copiedCode === invite.code ? (
                    <Check size={16} className="text-accent-lime" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
