"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, FileText, Gauge, ShieldCheck, Sparkles } from "lucide-react";

const items = [
  { href: "/admin", label: "Tổng quan", icon: Gauge },
  { href: "/admin/content", label: "Nội dung", icon: FileText },
  { href: "/admin/submissions", label: "Đề xuất", icon: ClipboardList },
  { href: "/admin/verifications", label: "Xác minh sinh viên", icon: ShieldCheck },
  { href: "/admin/freshness", label: "Độ mới ưu đãi", icon: Sparkles },
];

export function AdminNavigation() {
  const path = usePathname();
  return <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:sticky lg:top-0 lg:flex-col lg:overflow-visible lg:px-4 lg:py-6" aria-label="Điều hướng quản trị">
    {items.map(item => {
      const active = path === item.href || (item.href !== "/admin" && path.startsWith(item.href + "/"));
      return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl border-l-[3px] px-3 py-2.5 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-blue-300 ${active ? "border-blue-400 bg-blue-600/25 text-white" : "border-transparent text-slate-300 hover:bg-white/10 hover:text-white"}`}>
        <item.icon className="size-4 shrink-0" aria-hidden="true" />{item.label}
      </Link>;
    })}
  </nav>;
}
