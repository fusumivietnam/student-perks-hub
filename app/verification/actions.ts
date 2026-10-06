"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  institutionName: z.string().trim().min(2).max(200),
});

function isActiveVerification(
  status: string,
  expiresAt: string | null,
): boolean {
  if (status === "pending") return true;
  if (status !== "verified" || !expiresAt) return false;
  return new Date(expiresAt).getTime() > Date.now();
}

export async function requestStudentVerification(formData: FormData) {
  const auth = await getCurrentAuth();
  if (!auth?.email) redirect("/login?next=/verification");

  const parsed = requestSchema.safeParse({
    institutionName: formData.get("institutionName"),
  });

  if (!parsed.success) redirect("/verification?error=invalid-institution");

  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("student_verifications")
    .select("status,expires_at")
    .eq("user_id", auth.id)
    .in("status", ["pending", "verified"])
    .order("created_at", { ascending: false })
    .limit(5);

  if (existingError) redirect("/verification?error=status-check-failed");

  if (
    (existing ?? []).some((item) =>
      isActiveVerification(item.status, item.expires_at),
    )
  ) {
    redirect("/verification?error=active-request");
  }

  const { error } = await supabase.from("student_verifications").insert({
    user_id: auth.id,
    verification_email: auth.email,
    institution_name: parsed.data.institutionName,
  });

  // The database policy and unique pending index remain authoritative for races.
  if (error) redirect("/verification?error=request-failed");

  revalidatePath("/verification");
  revalidatePath("/account");
  redirect("/verification?success=1");
}
