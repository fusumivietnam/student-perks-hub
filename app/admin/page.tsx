import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ClipboardCheck, FolderOpen, ShieldCheck, Tags } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getCurrentAdmin } from "@/lib/admin";
import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Tổng quan quản trị", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login?next=/admin");
  const admin = await getCurrentAdmin();
  if (!admin) notFound();
  const supabase = await createClient();
  const [offers, categories, submissions, verifications] = await Promise.all([
    supabase.from("offers").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("student_verifications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  if ([offers, categories, submissions, verifications].some((item) => item.error)) throw new Error("Could not load admin dashboard");
  const metrics = [
    { label: "Ưu đãi", value: offers.count ?? 0, href: "/admin/content/offers", detail: "Xem danh sách", Icon: FolderOpen },
    { label: "Danh mục", value: categories.count ?? 0, href: "/admin/content/categories", detail: "Quản lý danh mục", Icon: Tags },
    { label: "Đề xuất chờ duyệt", value: submissions.count ?? 0, href: "/admin/submissions?status=pending", detail: "Duyệt đề xuất", Icon: ClipboardCheck },
    { label: "Xác minh chờ duyệt", value: verifications.count ?? 0, href: "/admin/verifications?status=pending", detail: "Duyệt xác minh", Icon: ShieldCheck },
  ];
  return (
    <main className="w-full px-4 pb-16 pt-9 sm:px-8 xl:px-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="ui-eyebrow">Không gian quản trị / Tổng quan</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Tổng quan quản trị</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Theo dõi dữ liệu hiện có và xử lý những tác vụ cần chú ý.</p>
        </div>
        <Link href="/admin/content/offers/new" className="ui-primary-action">Tạo ưu đãi mới <ArrowUpRight className="ml-2 size-4" aria-hidden="true" /></Link>
      </header>
      <section className="mt-9" aria-labelledby="admin-metrics-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="admin-metrics-heading" className="text-xl font-bold tracking-tight text-slate-950">Chỉ số vận hành</h2>
          <span className="text-xs font-medium text-slate-500">Dữ liệu hiện tại</span>
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
          {metrics.map((item) => (
            <Link key={item.label} href={item.href} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Card className="h-full gap-0 p-6 transition-[border-color,box-shadow] group-hover:border-blue-300 group-hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-600">{item.label}</p>
                <span className="rounded-xl bg-blue-50 p-2.5 text-primary"><item.Icon className="size-5" aria-hidden="true" /></span>
              </div>
              <p className="mt-4 text-4xl font-black tabular-nums tracking-tight text-slate-950">{item.value}</p>
              <p className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">{item.detail} <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-10 rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-5 sm:p-7" aria-labelledby="admin-shortcuts-heading">
        <p className="ui-eyebrow">Công việc tiếp theo</p>
        <h2 id="admin-shortcuts-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Thao tác nhanh</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Ưu tiên duyệt đề xuất, xác minh sinh viên và rà soát ưu đãi.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            { href: "/admin/submissions?status=pending", label: "Duyệt đề xuất", detail: "Kiểm tra nội dung do người dùng gửi" },
            { href: "/admin/verifications?status=pending", label: "Xác minh sinh viên", detail: "Xử lý yêu cầu đang chờ" },
            { href: "/admin/freshness", label: "Kiểm tra độ mới", detail: "Rà soát điều kiện ưu đãi" },
            { href: "/admin/content", label: "Quản lý nội dung", detail: "Biên tập ưu đãi và danh mục" },
          ].map((task) => (
            <Link key={task.href} href={task.href} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <Card className="min-h-24 flex-row items-center justify-between gap-4 transition group-hover:border-blue-200 group-hover:shadow-sm">
              <span><span className="block font-bold text-slate-950">{task.label}</span><span className="mt-1 block text-sm text-slate-500">{task.detail}</span></span>
              <ArrowUpRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
