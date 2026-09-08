"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthService } from "@/services/AuthService";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const authService = new AuthService(createClient());
    await authService.signOut();
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={loading}>
      {loading ? "Cerrando sesión…" : "Cerrar sesión"}
    </Button>
  );
}
