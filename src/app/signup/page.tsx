"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/ui/AppShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    alias: "",
    documentId: "",
    email: "",
    password: "",
    inviteCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
          alias: form.alias || null,
          document_id: form.documentId || null,
        },
      },
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message ?? "No se pudo crear la cuenta.");
      return;
    }

    if (form.inviteCode.trim()) {
      const { error: redeemError } = await supabase.rpc("redeem_invite_code", {
        p_code: form.inviteCode.trim(),
      });
      if (redeemError) {
        setLoading(false);
        setError(
          "Tu cuenta se creó, pero el código de invitación no es válido. Pídele uno nuevo a tu coach."
        );
        return;
      }
    }

    setLoading(false);
    router.push("/home");
    router.refresh();
  }

  return (
    <AppShell>
      <div className="flex min-h-dvh flex-col justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-center"
        >
          <h1 className="font-display text-2xl uppercase tracking-wide text-text-primary">
            Crea tu cuenta
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Únete a la comunidad de tu coach o box
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Nombres"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              required
            />
            <Input
              placeholder="Apellidos"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              required
            />
          </div>
          <Input
            placeholder="Alias (opcional)"
            value={form.alias}
            onChange={(e) => update("alias", e.target.value)}
          />
          <Input
            placeholder="Documento de identidad"
            value={form.documentId}
            onChange={(e) => update("documentId", e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
          />
          <Input
            placeholder="Código de invitación (si tu coach te lo dio)"
            value={form.inviteCode}
            onChange={(e) => update("inviteCode", e.target.value)}
          />

          {error && (
            <p className="text-sm text-accent-orange" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="mt-3">
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-text-primary underline underline-offset-4">
            Inicia sesión
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
