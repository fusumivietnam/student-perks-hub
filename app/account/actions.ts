"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const passwordSchema = z
  .object({
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmPassword"],
  });

export async function updatePassword(formData: FormData) {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login?next=/account");

  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/account?error=Mật+khẩu+phải+có+ít+nhất+8+ký+tự+và+khớp+nhau");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("Failed to update password", error);
    redirect("/account?error=Không+thể+cập+nhật+mật+khẩu+lúc+này");
  }

  redirect("/account?success=Mật+khẩu+đã+được+cập+nhật");
}
