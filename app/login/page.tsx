import { redirect } from "next/navigation";

import { signIn, signUp } from "@/app/login/actions";
import { getCurrentAuth } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
    next?: string | string[];
  }>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const auth = await getCurrentAuth();
  const params = await searchParams;
  const next = one(params.next);

  if (auth) {
    redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
  }

  const error = one(params.error);
  const message = one(params.message);

  return (
    <section className="mx-auto max-w-lg px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Tài khoản</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Đăng nhập</h1>
      <p className="mt-3 leading-7 text-slate-600">
        Dùng email và mật khẩu. OAuth chưa được bật cho đến khi có provider được
        cấu hình rõ ràng.
      </p>

      {error ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <form action={signIn} className="mt-8 grid gap-4 rounded-2xl border bg-white p-6 shadow-sm">
        {next ? <input type="hidden" name="next" value={next} /> : null}

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

        <label className="grid gap-1.5 text-sm font-medium">
          Mật khẩu
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            minLength={8}
            maxLength={128}
            className="rounded-xl border px-3 py-2.5"
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <button className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
            Đăng nhập
          </button>
          <button
            formAction={signUp}
            className="rounded-xl border px-4 py-3 text-sm font-semibold text-slate-700"
          >
            Tạo tài khoản
          </button>
        </div>
      </form>
    </section>
  );
}
