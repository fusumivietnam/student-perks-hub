import type { Metadata } from "next";
import Link from "next/link";

import { requestPasswordReset } from "@/app/forgot-password/actions";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  error?: string | string[];
  sent?: string | string[];
}>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = one(params.error);
  const sent = one(params.sent) === "1";

  return (
    <section className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Tài khoản</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Quên mật khẩu</h1>
      <p className="mt-3 leading-7 text-slate-600">
        Nhập email tài khoản. Nếu email tồn tại, hệ thống sẽ gửi liên kết đặt lại mật khẩu.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {sent ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Nếu email thuộc một tài khoản, liên kết đặt lại mật khẩu đã được gửi. Hãy kiểm tra cả thư mục spam.
        </div>
      ) : (
        <form action={requestPasswordReset} className="mt-8 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm">
          <label className="grid gap-1.5 text-sm font-medium">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              maxLength={254}
              className="rounded-xl border px-3 py-2.5"
            />
          </label>
          <button className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
            Gửi liên kết đặt lại mật khẩu
          </button>
        </form>
      )}

      <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
        ← Quay lại đăng nhập
      </Link>
    </section>
  );
}
