"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus } from "@/lib/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I

function generateCode(length = 6): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

export async function generateInviteCode(communityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado." };
  }

  // Un par de intentos por si hay colisión con el código (poco probable).
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode();
    const { error } = await supabase.from("invite_codes").insert({
      community_id: communityId,
      code,
      created_by: user.id,
    });

    if (!error) {
      revalidatePath("/coach");
      return { code };
    }

    if (!error.message.includes("duplicate")) {
      return { error: error.message };
    }
  }

  return { error: "No se pudo generar el código, intenta de nuevo." };
}

export async function toggleMembershipStatus(
  membershipId: string,
  nextStatus: MembershipStatus
) {
  const supabase = await createClient();

  const timestampField =
    nextStatus === "active" ? "activated_at" : "deactivated_at";

  const { error } = await supabase
    .from("memberships")
    .update({
      status: nextStatus,
      [timestampField]: new Date().toISOString(),
    })
    .eq("id", membershipId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/coach");
  return { success: true };
}
