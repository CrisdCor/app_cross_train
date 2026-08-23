"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/ui/AppShell";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    router.push("/home");
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/home` },
    });
  }

  return (
    <AppShell>
      <div className="flex min-h-dvh flex-col justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 text-center"
        >
          <h1 className="font-display text-3xl uppercase tracking-wide text-text-primary">
            Ingresar
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Inicia sesión para ver tu programación
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-sm text-accent-orange" role="alert">
              {error}
            </p>
          )}

          <div className="mt-3 flex flex-col gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Ingresando…" : "Ingresar"}
            </Button>
            <Button type="button" variant="outline" onClick={handleGoogle}>
              Iniciar sesión con Google
            </Button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-text-secondary">
          Si aún no te has registrado{" "}
          <Link href="/signup" className="font-semibold text-text-primary underline underline-offset-4">
            crea una cuenta
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
