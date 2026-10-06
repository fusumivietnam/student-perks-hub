"use client";

import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body className="bg-white text-slate-950">
        <main
          className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 px-4 py-16"
          role="alert"
        >
          <div className="w-full max-w-2xl rounded-[2rem] border bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-50 text-red-700">
              <AlertOctagon className="size-8" aria-hidden="true" />
            </div>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
              Lỗi hệ thống
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Student Perks Hub tạm thời gián đoạn
            </h1>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
              Ứng dụng chưa thể hoàn tất yêu cầu này. Hãy thử tải lại giao diện; nếu lỗi vẫn
              tiếp diễn, vui lòng quay lại sau.
            </p>
            {error.digest ? (
              <p className="mt-3 text-xs text-slate-500">Mã tham chiếu: {error.digest}</p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Thử lại
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
