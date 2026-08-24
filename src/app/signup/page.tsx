"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/ui/AppShell";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type SignupRole = "user" | "head_coach" | "coach";

const ROLE_OPTIONS: { value: SignupRole; label: string }[] = [
  { value: "user", label: "Atleta" },
  { value: "head_coach", label: "Head Coach" },
  { value: "coach", label: "Coach" },
];

export default function SignupPage() {
  const [role, setRole] = useState<SignupRole>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (role !== "user" && !code.trim()) {
      setError("Necesitas un código temporal para registrarte con ese rol.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message ?? "No se pudo crear la cuenta.");
      return;
    }

    if (role !== "user") {
      const { error: redeemError } = await supabase.rpc("redeem_role_code", {
        p_code: code.trim(),
      });
      if (redeemError) {
        setLoading(false);
        setError(
          "Tu cuenta se creó, pero el código no es válido o ya expiró. Pídele uno nuevo a quien te lo compartió."
        );
        return;
      }
    }

    setLoading(false);
    // Navegación dura a propósito: ver comentario equivalente en /login.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/home";
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
            Elige tu rol para empezar
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <SegmentedControl options={ROLE_OPTIONS} value={role} onChange={setRole} />

          <Input
            type="email"
            placeholder="Correo electrónico"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PasswordInput
            placeholder="Contraseña"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordInput
            placeholder="Confirma tu contraseña"
            autoComplete="new-password"
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {role !== "user" && (
            <Input
              placeholder="Código temporal"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          )}

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
