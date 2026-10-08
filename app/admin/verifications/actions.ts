"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  verificationId: z.string().uuid(),
  status: z.enum(["verified", "rejected", "expired"]),
});

export async function reviewStudentVerification(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Admin authorization required");

  const parsed = reviewSchema.safeParse({
    verificationId: formData.get("verificationId"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("Invalid verification review request");

  const now = new Date();
  const supabase = await createClient();

  if (parsed.data.status === "expired") {
    const { data, error } = await supabase
      .from("student_verifications")
      .update({
        status: "expired",
        expires_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", parsed.data.verificationId)
      .eq("status", "verified")
      .select("id")
      .maybeSingle();

    if (error) throw new Error("Could not expire student verification");
    if (!data) throw new Error("Verification state changed; refresh and try again");
  } else {
    const expiresAt = new Date(now);
    expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);

    const { data, error } = await supabase
      .from("student_verifications")
      .update({
        status: parsed.data.status,
        reviewed_by: admin.id,
        reviewed_at: now.toISOString(),
        expires_at:
          parsed.data.status === "verified" ? expiresAt.toISOString() : null,
        updated_at: now.toISOString(),
      })
      .eq("id", parsed.data.verificationId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (error) throw new Error("Could not review student verification");
    if (!data) throw new Error("Verification state changed; refresh and try again");
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/verification");
  revalidatePath("/account");
}
