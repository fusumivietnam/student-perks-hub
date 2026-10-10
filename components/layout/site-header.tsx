import Link from "next/link";

import { signOut } from "@/app/login/actions";
import { BrandLogo } from "@/components/brand-logo";
import { getCurrentAuth } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/offers", label: "Tất cả ưu đãi" },
  { href: "/search", label: "Tìm kiếm" },
  { href: "/categories", label: "Danh mục" },
  { href: "/saved", label: "Đã lưu" },
  { href: "/submit", label: "Gửi ưu đãi" },
];

export async function SiteHeader() {
  const auth = await getCurrentAuth();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLogo />

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate-600 transition hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </nav>

        {auth ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/account/submissions"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
            >
              Đề xuất
            </Link>
            <Link
              href="/account"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Tài khoản
            </Link>
            <span className="hidden max-w-40 truncate text-xs text-slate-500 lg:block">
              {auth.email ?? "Đã đăng nhập"}
            </span>
            <form action={signOut}>
              <button className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:px-4">
                Đăng xuất
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </header>
  );
}
