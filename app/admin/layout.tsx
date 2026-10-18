import Link from "next/link";
import { ClipboardList, FileText, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/admin";
import { getCurrentAuth } from "@/lib/auth";

const adminNav = [
  { href: "/admin", label: "Tổng quan", icon: Gauge },
  { href: "/admin/content", label: "Nội dung", icon: FileText },
  { href: "/admin/submissions", label: "Đề xuất", icon: ClipboardList },
  { href: "/admin/verifications", label: "Xác minh sinh viên", icon: ShieldCheck },
  { href: "/admin/freshness", label: "Độ mới ưu đãi", icon: Sparkles },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login?next=/admin");

  const admin = await getCurrentAdmin();
  if (!admin) notFound();

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-slate-50/70 lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">
      <aside className="border-b bg-white lg:border-b-0 lg:border-r" aria-label="Khu vực điều hướng quản trị">
        <div className="hidden border-b px-5 py-6 lg:block">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Student Perks Hub</p>
          <p className="mt-1 text-lg font-bold text-slate-950">Admin Workspace</p>
          <p className="mt-1 text-xs text-slate-500">Vận hành và quản lý nội dung</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible lg:py-5" aria-label="Điều hướng quản trị">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <div className="border-b bg-white px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700">Không gian quản trị</p>
            <span className="max-w-full truncate rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-primary" title={admin.email ?? undefined}>
              {admin.email ?? "Quản trị viên"}
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
