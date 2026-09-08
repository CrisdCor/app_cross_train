"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthService, AuthError } from "@/services/AuthService";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const authService = new AuthService(createClient());

    try {
      await authService.signIn({ identifier, password });
      // Navegación dura a propósito: garantiza que el Server Component de
      // /home lea la sesión recién creada sin depender del router cache.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/home";
    } catch (err) {
      setLoading(false);
      setError(err instanceof AuthError ? err.message : "No se pudo iniciar sesión.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6">
      <div className="mb-10">
        <h1 className="label-heading text-2xl text-text-primary">Ingresar</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Inicia sesión para ver tu programación
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="text"
          placeholder="Usuario o correo electrónico"
          autoComplete="username"
          autoCapitalize="off"
          spellCheck={false}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} showArrow className="mt-3">
          {loading ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/signup" className="font-bold text-text-primary underline underline-offset-4">
          Crea una cuenta
        </Link>
      </p>
    </div>
  );
}
