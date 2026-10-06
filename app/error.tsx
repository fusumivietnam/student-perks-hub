"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section
      className="mx-auto flex min-h-[68vh] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8"
      role="alert"
    >
      <div className="w-full rounded-[2rem] border bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">
          Có lỗi xảy ra
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Chưa thể tải nội dung
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
          Yêu cầu chưa hoàn tất. Hãy thử lại; nếu lỗi vẫn tiếp diễn, bạn có thể quay về
          trang chủ và thử lại sau.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-slate-500">Mã tham chiếu: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Home className="size-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}
