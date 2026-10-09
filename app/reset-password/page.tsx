import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { updatePassword } from "@/app/reset-password/actions";
import { getCurrentAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  robots: { index: false, follow: false },
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const auth = await getCurrentAuth();
  if (!auth) {
    redirect("/login?error=Phiên+đặt+lại+mật+khẩu+không+hợp+lệ+hoặc+đã+hết+hạn");
  }

  const params = await searchParams;
  const error = one(params.error);

  return (
    <section className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Tài khoản</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Đặt lại mật khẩu</h1>
      <p className="mt-3 leading-7 text-slate-600">
        Chọn mật khẩu mới cho {auth.email ?? "tài khoản của bạn"}. Sau khi cập nhật, bạn sẽ cần đăng nhập lại.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form action={updatePassword} className="mt-8 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm">
        <label className="grid gap-1.5 text-sm font-medium">
          Mật khẩu mới
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            className="rounded-xl border px-3 py-2.5"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium">
          Xác nhận mật khẩu mới
          <input
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            className="rounded-xl border px-3 py-2.5"
          />
        </label>

        <button className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
          Cập nhật mật khẩu
        </button>
      </form>
    </section>
  );
}
