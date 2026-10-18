import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
    { label: "Ưu đãi", value: offers.count ?? 0, href: "/admin/content", detail: "Quản lý danh sách" },
    { label: "Danh mục", value: categories.count ?? 0, href: "/admin/content", detail: "Chỉnh sửa danh mục" },
    { label: "Đề xuất chờ duyệt", value: submissions.count ?? 0, href: "/admin/submissions?status=pending", detail: "Xử lý hàng đợi" },
    { label: "Xác minh chờ duyệt", value: verifications.count ?? 0, href: "/admin/verifications?status=pending", detail: "Duyệt yêu cầu" },
  ];
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold text-primary">Administration</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Moderation console</h1>
          <p className="mt-3 text-sm text-slate-600">Tổng quan quản trị · {admin.email ?? "Tài khoản quản trị"}</p>
        </div>
        <Link href="/admin/content" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white">Quản lý nội dung →</Link>
      </div>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Chỉ số quản trị">
        {metrics.map((item) => (
          <Link key={item.label} href={item.href} className="rounded-2xl border bg-white p-5 shadow-sm transition hover:border-primary hover:shadow-md">
            <p className="text-sm font-semibold text-slate-600">{item.label}</p>
            <p className="mt-3 text-4xl font-black tabular-nums">{item.value}</p>
            <p className="mt-4 text-sm font-semibold text-primary">{item.detail} →</p>
          </Link>
        ))}
      </section>
      <section className="mt-10 rounded-2xl border bg-slate-50 p-6">
        <h2 className="text-xl font-bold">Thao tác nhanh</h2>
        <p className="mt-2 text-sm text-slate-600">Tập trung xử lý đề xuất, xác minh và kiểm tra độ mới trước khi chỉnh sửa nội dung.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/submissions?status=pending" className="rounded-xl border bg-white p-4 font-semibold hover:border-primary">Duyệt đề xuất →</Link>
          <Link href="/admin/verifications?status=pending" className="rounded-xl border bg-white p-4 font-semibold hover:border-primary">Xác minh sinh viên →</Link>
          <Link href="/admin/freshness" className="rounded-xl border bg-white p-4 font-semibold hover:border-primary">Kiểm tra độ mới →</Link>
          <Link href="/admin/content" className="rounded-xl border bg-white p-4 font-semibold hover:border-primary">Biên tập nội dung →</Link>
        </div>
      </section>
    </main>
  );
}
