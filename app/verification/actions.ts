"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  institutionName: z.string().trim().min(2).max(200),
});

export async function requestStudentVerification(formData: FormData) {
  const auth = await getCurrentAuth();
  if (!auth?.email) redirect("/login?next=/verification");

  const parsed = requestSchema.safeParse({
    institutionName: formData.get("institutionName"),
  });

  if (!parsed.success) {
    redirect("/verification?error=Vui+lòng+nhập+tên+trường+hoặc+tổ+chức+hợp+lệ");
  }

  const supabase = await createClient();
  const { data: active, error: activeError } = await supabase
    .from("student_verifications")
    .select("id,status")
    .eq("user_id", auth.id)
    .in("status", ["pending", "verified"])
    .limit(1)
    .maybeSingle();

  if (activeError) {
    console.error("Failed to check verification status", activeError);
    redirect("/verification?error=Không+thể+kiểm+tra+trạng+thái+xác+minh");
  }

  if (active) {
    redirect("/verification?error=Bạn+đã+có+yêu+cầu+xác+minh+đang+hoạt+động");
  }

  const { error } = await supabase.from("student_verifications").insert({
    user_id: auth.id,
    verification_email: auth.email,
    institution_name: parsed.data.institutionName,
  });

  if (error) {
    console.error("Failed to request student verification", error);
    redirect("/verification?error=Không+thể+gửi+yêu+cầu+xác+minh+lúc+này");
  }

  redirect("/verification?success=1");
}
