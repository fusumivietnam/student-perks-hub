import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=Liên+kết+xác+thực+không+hợp+lệ", url.origin),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback exchange failed", {
      status: error.status,
      code: error.code,
    });
    return NextResponse.redirect(
      new URL("/login?error=Liên+kết+xác+thực+đã+hết+hạn+hoặc+không+hợp+lệ", url.origin),
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
