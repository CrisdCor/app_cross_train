"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { completeProfile } from "@/app/complete-profile/actions";
import type { Profile } from "@/lib/types";

export function CompleteProfileForm({
  userId,
  profile,
}: {
  userId: string;
  profile: Profile | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [alias, setAlias] = useState(profile?.alias ?? "");
  const [documentId, setDocumentId] = useState(profile?.document_id ?? "");
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.avatar_url ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let avatarUrl: string | null = null;

    if (avatarFile) {
      const supabase = createClient();
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });

      if (uploadError) {
        setLoading(false);
        setError("No se pudo subir la foto. Intenta de nuevo.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      avatarUrl = publicUrlData.publicUrl;
    }

    const result = await completeProfile({
      firstName,
      lastName,
      alias,
      documentId,
      whatsapp,
      avatarUrl,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="mb-2 flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative h-24 w-24 overflow-hidden rounded-full border border-border bg-surface-2"
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Tu foto"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-text-muted">
              <Camera size={26} />
            </div>
          )}
          <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-3">
            <Camera size={14} className="text-text-secondary" />
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="Nombres"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <Input
          placeholder="Apellidos"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <Input
        placeholder="Alias (opcional)"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
      />
      <Input
        placeholder="Documento de identidad"
        value={documentId}
        onChange={(e) => setDocumentId(e.target.value)}
        required
      />
      <Input
        type="tel"
        placeholder="WhatsApp (opcional)"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
      />

      {error && (
        <p className="text-sm text-accent-orange" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "Guardando…" : "Guardar y continuar"}
      </Button>
    </form>
  );
}
