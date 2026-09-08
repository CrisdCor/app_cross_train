"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/client";
import { ProfileService } from "@/services/ProfileService";
import { Profile, type Gender } from "@/domain/Profile";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const GENDER_OPTIONS: Gender[] = ["male", "female"];

interface CompleteProfileFormProps {
  userId: string;
  showProgramField: boolean;
  bioPlaceholder: string;
  initialFirstName: string;
  initialLastName: string;
  initialBio: string;
  initialProgramName: string;
  initialAvatarUrl: string | null;
  initialGender: Gender | null;
  initials: string;
}

export function CompleteProfileForm({
  userId,
  showProgramField,
  bioPlaceholder,
  initialFirstName,
  initialLastName,
  initialBio,
  initialProgramName,
  initialAvatarUrl,
  initialGender,
  initials,
}: CompleteProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [bio, setBio] = useState(initialBio);
  const [programName, setProgramName] = useState(initialProgramName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [gender, setGender] = useState<Gender | null>(initialGender);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !bio.trim() || !gender) {
      setError("Nombre, apellidos, sexo y biografía son obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    const service = new ProfileService(createClient());
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      await service.updateProfile(userId, {
        fullName,
        bio: bio.trim(),
        programName: programName.trim(),
        gender,
        ...(avatarUrl ? { avatarUrl } : {}),
      });
      // Navegación dura a propósito: /perfil es un Server Component que
      // debe leer el perfil ya actualizado, no una versión cacheada.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/perfil";
    } catch {
      setLoading(false);
      setError("No se pudo guardar el perfil.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <AvatarUploader
        userId={userId}
        initialAvatarUrl={avatarUrl}
        initials={initials}
        onUploaded={setAvatarUrl}
      />

      <div className="flex flex-col gap-3">
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
        <div className="flex flex-col gap-2">
          <p className="label-heading text-xs text-text-muted">Sexo</p>
          <div className="flex gap-2">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setGender(option)}
                aria-pressed={gender === option}
                className={clsx(
                  "h-[48px] flex-1 border border-black text-sm font-bold uppercase tracking-wide transition-opacity active:opacity-70",
                  gender === option ? "bg-black text-white" : "bg-white text-black"
                )}
              >
                {Profile.GENDER_LABEL[option]}
              </button>
            ))}
          </div>
        </div>
        {showProgramField && (
          <Input
            placeholder="Nombre de tu programación (opcional)"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
          />
        )}
        <textarea
          placeholder={bioPlaceholder}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          required
          className="w-full resize-none border border-border bg-white p-4 text-[15px] text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-black"
        />
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : "Guardar perfil"}
      </Button>
    </form>
  );
}
