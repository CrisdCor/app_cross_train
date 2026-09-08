"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthService, AuthError } from "@/services/AuthService";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";
type UsernameCheckResult = { username: string; available: boolean };

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [checkResult, setCheckResult] = useState<UsernameCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedUsername = AuthService.normalizeUsername(username);
  const formatValid = normalizedUsername
    ? AuthService.isUsernameFormatValid(normalizedUsername)
    : false;

  // Estado derivado en render: el efecto solo dispara la verificación async y
  // guarda su resultado, nunca hace setState de forma síncrona en su cuerpo.
  let usernameStatus: UsernameStatus;
  if (!normalizedUsername) {
    usernameStatus = "idle";
  } else if (!formatValid) {
    usernameStatus = "invalid";
  } else if (checkResult && checkResult.username === normalizedUsername) {
    usernameStatus = checkResult.available ? "available" : "taken";
  } else {
    usernameStatus = "checking";
  }

  useEffect(() => {
    const normalized = AuthService.normalizeUsername(username);

    if (!normalized || !AuthService.isUsernameFormatValid(normalized)) {
      return;
    }

    const authService = new AuthService(createClient());
    const timeout = setTimeout(async () => {
      const available = await authService.isUsernameAvailable(normalized);
      setCheckResult({ username: normalized, available });
    }, 400);

    return () => clearTimeout(timeout);
  }, [username]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (usernameStatus !== "available") {
      setError("Elige un usuario disponible antes de continuar.");
      return;
    }

    setLoading(true);
    const authService = new AuthService(createClient());

    try {
      await authService.signUp({ email, password, username });
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/home";
    } catch (err) {
      setLoading(false);
      setError(err instanceof AuthError ? err.message : "No se pudo crear la cuenta.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-10">
      <div className="mb-8">
        <h1 className="label-heading text-2xl text-text-primary">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Correo, contraseña y un usuario para que te encuentren
        </p>
      </div>

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

        <div>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-text-muted">
              @
            </span>
            <Input
              placeholder="usuario"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-8 pr-10"
              required
            />
            {usernameStatus === "available" && (
              <Check
                size={18}
                strokeWidth={1.5}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-success"
              />
            )}
            {(usernameStatus === "taken" || usernameStatus === "invalid") && (
              <X
                size={18}
                strokeWidth={1.5}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-error"
              />
            )}
          </div>
          {usernameStatus === "invalid" && (
            <p className="mt-1.5 text-xs text-error">
              3 a 30 caracteres: minúsculas, números, puntos o guiones bajos.
            </p>
          )}
          {usernameStatus === "taken" && (
            <p className="mt-1.5 text-xs text-error">Ese usuario ya está en uso.</p>
          )}
          {usernameStatus === "available" && (
            <p className="mt-1.5 text-xs text-success">Disponible.</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} showArrow className="mt-3">
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-bold text-text-primary underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
