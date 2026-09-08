"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ProfileService } from "@/services/ProfileService";

interface AvatarUploaderProps {
  userId: string;
  initialAvatarUrl: string | null;
  initials: string;
  onUploaded: (url: string) => void;
}

export function AvatarUploader({
  userId,
  initialAvatarUrl,
  initials,
  onUploaded,
}: AvatarUploaderProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const service = new ProfileService(createClient());

    try {
      const url = await service.uploadAvatar(userId, file);
      setAvatarUrl(url);
      onUploaded(url);
    } catch {
      setError("No se pudo subir la foto.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Cambiar foto de perfil"
        className="relative flex h-24 w-24 items-center justify-center overflow-hidden bg-black text-xl font-bold text-white disabled:opacity-60"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/70 py-1.5">
          <Camera size={14} strokeWidth={1.5} className="text-white" />
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {uploading && <p className="text-xs text-text-muted">Subiendo…</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
