import Link from "next/link";
import { ArrowLeft, ClipboardList, FileText, Gauge, ShieldCheck, Sparkles } from "lucide-react";
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
    <div data-admin-shell className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="border-b border-slate-800 bg-slate-950 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:border-slate-800" aria-label="Khu vực điều hướng quản trị">
        <div className="hidden border-b border-white/10 px-6 py-7 lg:block">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-300">Student Perks Hub</p>
          <p className="mt-2 text-xl font-bold text-white">Admin Workspace</p>
          <p className="mt-1 text-xs text-slate-400">Vận hành và quản lý nội dung</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:sticky lg:top-0 lg:flex-col lg:overflow-visible lg:py-5" aria-label="Điều hướng quản trị">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-700 hover:text-primary"><ArrowLeft className="size-4" aria-hidden="true" /> Về trang sinh viên</Link>
            <span className="max-w-full truncate rounded-full bg-blue-50 px-3 py-2 text-xs font-medium text-primary" title={admin.email ?? undefined}>
              {admin.email ?? "Quản trị viên"}
            </span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
