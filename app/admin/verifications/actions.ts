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
  const expiresAt = new Date(now);
  expiresAt.setUTCFullYear(expiresAt.getUTCFullYear() + 1);

  const supabase = await createClient();
  const { error } = await supabase
    .from("student_verifications")
    .update({
      status: parsed.data.status,
      reviewed_by: admin.id,
      reviewed_at: now.toISOString(),
      expires_at: parsed.data.status === "verified" ? expiresAt.toISOString() : null,
      updated_at: now.toISOString(),
    })
    .eq("id", parsed.data.verificationId);

  if (error) throw new Error("Could not review student verification");

  revalidatePath("/admin/verifications");
  revalidatePath("/verification");
}
