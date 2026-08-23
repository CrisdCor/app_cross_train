"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function joinCommunity(code: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc("redeem_invite_code", {
    p_code: code.trim(),
  });

  if (error) {
    return { error: "Ese código no es válido o ya expiró." };
  }

  revalidatePath("/home");
  return { success: true };
}
