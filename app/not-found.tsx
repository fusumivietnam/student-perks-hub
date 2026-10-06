import Link from "next/link";
import { ArrowRight, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[68vh] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full rounded-[2rem] border bg-gradient-to-br from-blue-50 via-white to-violet-50 p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <SearchX className="size-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Lỗi 404
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Không tìm thấy trang
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
          Trang bạn đang tìm có thể đã được di chuyển, đổi địa chỉ hoặc không còn tồn tại.
          Bạn có thể quay về trang chủ hoặc tiếp tục khám phá các ưu đãi đang hoạt động.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Home className="size-4" aria-hidden="true" />
            Về trang chủ
          </Link>
          <Link
            href="/offers"
            className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Xem tất cả ưu đãi
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
