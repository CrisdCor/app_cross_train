"use server";

import { createClient } from "@/lib/supabase/server";

export interface CompleteProfileInput {
  firstName: string;
  lastName: string;
  alias: string;
  documentId: string;
  whatsapp: string;
  avatarUrl: string | null;
  communityLogoUrl?: string | null;
}

export async function completeProfile(input: CompleteProfileInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  const update: Record<string, string | null> = {
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    alias: input.alias.trim() || null,
    document_id: input.documentId.trim(),
    whatsapp: input.whatsapp.trim() || null,
  };

  if (input.avatarUrl) {
    update.avatar_url = input.avatarUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (input.communityLogoUrl) {
    const { error: logoError } = await supabase
      .from("communities")
      .update({ logo_url: input.communityLogoUrl })
      .eq("owner_id", user.id);

    if (logoError) {
      return { error: logoError.message };
    }
  }

  return { success: true };
}
