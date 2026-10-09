"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { absoluteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email().max(254);

export async function requestPasswordReset(formData: FormData) {
  const parsed = emailSchema.safeParse(formData.get("email"));

  if (!parsed.success) {
    redirect("/forgot-password?error=Vui+lòng+nhập+email+hợp+lệ");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: absoluteUrl("/auth/callback?next=/reset-password"),
  });

  if (error) {
    console.error("Password reset request failed", {
      status: error.status,
      code: error.code,
    });
  }

  // Keep the response intentionally generic so account existence is not disclosed.
  redirect(
    "/forgot-password?sent=1",
  );
}
