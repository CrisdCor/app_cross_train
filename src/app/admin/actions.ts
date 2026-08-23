"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O ni 1/I

function generateCode(length = 6): string {
  const bytes = randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

export async function generateHeadCoachCode() {
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
    const { error } = await supabase.from("role_invite_codes").insert({
      code,
      target_role: "head_coach",
      created_by: user.id,
    });

    if (!error) {
      revalidatePath("/admin");
      return { code };
    }

    if (!error.message.includes("duplicate")) {
      return { error: error.message };
    }
  }

  return { error: "No se pudo generar el código, intenta de nuevo." };
}
