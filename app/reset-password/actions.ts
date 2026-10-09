"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const resetSchema = z
  .object({
    password: z.string().min(8).max(128),
    confirmPassword: z.string().min(8).max(128),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export async function updatePassword(formData: FormData) {
  const auth = await getCurrentAuth();
  if (!auth) {
    redirect("/login?error=Phiên+đặt+lại+mật+khẩu+không+hợp+lệ+hoặc+đã+hết+hạn");
  }

  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    redirect("/reset-password?error=Mật+khẩu+phải+có+ít+nhất+8+ký+tự+và+khớp+nhau");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error("Password update failed", {
      status: error.status,
      code: error.code,
    });
    redirect("/reset-password?error=Không+thể+cập+nhật+mật+khẩu+lúc+này");
  }

  await supabase.auth.signOut();
  redirect("/login?message=Mật+khẩu+đã+được+cập+nhật.+Hãy+đăng+nhập+lại");
}
