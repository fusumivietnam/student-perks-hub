import Link from "next/link";
import { GraduationCap } from "lucide-react";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/offers", label: "Tất cả ưu đãi" },
  { href: "/categories", label: "Danh mục" },
  { href: "/saved", label: "Đã lưu" },
  { href: "/submit", label: "Gửi ưu đãi" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" aria-hidden="true" />
          </span>
          <span>Student Perks Hub</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-slate-600 transition hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Đăng nhập
        </Link>
      </div>
    </header>
  );
}
