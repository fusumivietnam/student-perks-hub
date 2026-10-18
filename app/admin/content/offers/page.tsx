import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quản lý ưu đãi", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
type Query = { q?: string; status?: string; page?: string };
const statuses = ["all", "draft", "published", "expired", "archived"] as const;
const labels: Record<string, string> = { all: "Tất cả", draft: "Bản nháp", published: "Đã xuất bản", expired: "Hết hạn", archived: "Lưu trữ" };
const PAGE_SIZE = 20;
export default async function OffersAdminPage({ searchParams }: { searchParams: Promise<Query> }) {
  const p = await searchParams;
  const q = (typeof p.q === "string" ? p.q : "").trim().slice(0, 80);
  const status = statuses.includes(p.status as typeof statuses[number]) ? p.status! : "all";
  const requestedPage = Math.max(1, Math.min(10000, Number.parseInt(p.page ?? "1", 10) || 1));
  const supabase = await createClient();
  let query = supabase.from("offers").select("id,title,provider,slug,status,updated_at", { count: "exact" });
  if (status !== "all") query = query.eq("status", status);
  if (q) query = query.or(`title.ilike.%${q.replace(/[%,().]/g, "")}%,provider.ilike.%${q.replace(/[%,().]/g, "")}%`);
  const result = await query.order("updated_at", { ascending: false }).order("id", { ascending: true }).range((requestedPage - 1) * PAGE_SIZE, requestedPage * PAGE_SIZE - 1);
  if (result.error) throw new Error("Could not load admin offers");
  const count = result.count ?? 0;
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const href = (page: number) => `/admin/content/offers?${new URLSearchParams({ ...(q ? { q } : {}), ...(status !== "all" ? { status } : {}), page: String(page) })}`;
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><Link href="/admin/content" className="text-sm text-primary">← Nội dung</Link><h1 className="mt-2 text-3xl font-black">Quản lý ưu đãi</h1><p className="mt-2 text-sm text-slate-600">Tìm kiếm và chỉnh sửa từng ưu đãi.</p></div>
      <Link href="/admin/content/offers/new" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2 font-semibold text-white">+ Tạo ưu đãi mới</Link>
    </div>
    <form className="mt-7 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-[1fr_200px_auto]" action="/admin/content/offers">
      <label className="grid gap-1 text-sm font-semibold">Tìm theo tên hoặc nhà cung cấp<input name="q" defaultValue={q} maxLength={80} className="min-h-11 rounded-lg border px-3" /></label>
      <label className="grid gap-1 text-sm font-semibold">Trạng thái<select name="status" defaultValue={status} className="min-h-11 rounded-lg border px-3">{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></label>
      <button className="min-h-11 self-end rounded-lg bg-slate-900 px-5 font-semibold text-white">Lọc</button>
    </form>
    <p className="mt-5 text-sm text-slate-600" role="status">{count} ưu đãi phù hợp</p>
    <div className="mt-3 overflow-x-auto rounded-2xl border bg-white">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-600"><tr><th scope="col" className="px-4 py-3">Ưu đãi</th><th scope="col" className="px-4 py-3">Nhà cung cấp</th><th scope="col" className="px-4 py-3">Trạng thái</th><th scope="col" className="px-4 py-3">Cập nhật</th><th scope="col" className="px-4 py-3">Thao tác</th></tr></thead>
        <tbody className="divide-y">{(result.data??[]).map(o=><tr key={o.id}><td className="px-4 py-3 font-semibold">{o.title}</td><td className="px-4 py-3">{o.provider}</td><td className="px-4 py-3">{labels[o.status]??o.status}</td><td className="px-4 py-3">{new Date(o.updated_at).toLocaleDateString("vi-VN")}</td><td className="px-4 py-3"><Link className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline" href={`/admin/content/offers/${o.id}`}>Chỉnh sửa</Link></td></tr>)}</tbody>
      </table>
      {!result.data?.length && <p className="p-6 text-center text-slate-600">Không tìm thấy ưu đãi. Thử thay đổi bộ lọc.</p>}
    </div>
    <nav aria-label="Phân trang ưu đãi quản trị" className="mt-5 flex items-center justify-between">
      {requestedPage > 1 ? <Link href={href(requestedPage-1)} className="rounded-xl border bg-white px-4 py-3">← Trước</Link>:<span/>}
      <span className="text-sm text-slate-600">Trang {Math.min(requestedPage,pages)} / {pages}</span>
      {requestedPage < pages ? <Link href={href(requestedPage+1)} className="rounded-xl border bg-white px-4 py-3">Sau →</Link>:<span/>}
    </nav>
  </main>;
}
