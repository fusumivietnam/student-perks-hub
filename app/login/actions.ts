"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  next: z.string().optional(),
});

function safeNextPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function loginRedirect(params: { error?: string; message?: string; next?: string }) {
  const search = new URLSearchParams();
  if (params.error) search.set("error", params.error);
  if (params.message) search.set("message", params.message);

  const next = safeNextPath(params.next);
  if (next !== "/") search.set("next", next);

  const query = search.toString();
  return query ? `/login?${query}` : "/login";
}

export async function signIn(formData: FormData) {
  const next = typeof formData.get("next") === "string" ? String(formData.get("next")) : undefined;
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next,
  });

  if (!parsed.success) {
    redirect(
      loginRedirect({
        error: "Thông tin đăng nhập không hợp lệ",
        next,
      }),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect(
      loginRedirect({
        error: "Email hoặc mật khẩu không đúng",
        next: parsed.data.next,
      }),
    );
  }

  redirect(safeNextPath(parsed.data.next));
}

export async function signUp(formData: FormData) {
  const next = typeof formData.get("next") === "string" ? String(formData.get("next")) : undefined;
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next,
  });

  if (!parsed.success) {
    redirect(
      loginRedirect({
        error: "Email hoặc mật khẩu không hợp lệ",
        next,
      }),
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    redirect(
      loginRedirect({
        error: "Không thể tạo tài khoản",
        next: parsed.data.next,
      }),
    );
  }

  if (data.session) {
    redirect(safeNextPath(parsed.data.next));
  }

  redirect(
    loginRedirect({
      message: "Kiểm tra email để xác nhận tài khoản",
      next: parsed.data.next,
    }),
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
