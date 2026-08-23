"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { joinCommunity } from "@/app/home/actions";

export function JoinCommunityCard() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await joinCommunity(code);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="mx-5 mt-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-3">
          <Users size={20} className="text-text-secondary" />
        </div>
        <div>
          <p className="font-body text-base font-bold text-text-primary">
            Únete a tu comunidad
          </p>
          <p className="text-sm text-text-secondary">
            Ingresa el código que te dio tu coach
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input
          placeholder="Código"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="uppercase tracking-[0.2em]"
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Uniéndote…" : "Unirme"}
        </Button>
      </form>

      {error && (
        <p className="mt-2 text-sm text-accent-orange" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
