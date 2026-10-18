import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quản lý ưu đãi", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
type Query = { q?: string; status?: string; page?: string };
const statuses = ["all", "draft", "published", "expired", "archived"] as const;
const labels: Record<string, string> = { all: "Tất cả", draft: "Bản nháp", published: "Đã xuất bản", expired: "Hết hạn", archived: "Lưu trữ" };
const PAGE_SIZE = 20;
const badgeTone: Record<string, "secondary" | "success" | "warning" | "outline"> = {draft:"secondary",published:"success",expired:"warning",archived:"outline"};
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
  return <main className="w-full px-4 py-10 sm:px-8 xl:px-10">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><Link href="/admin/content" className="text-sm text-primary">← Nội dung</Link><h1 className="mt-2 text-3xl font-black">Quản lý ưu đãi</h1><p className="mt-2 text-sm text-slate-600">Tìm kiếm và chỉnh sửa từng ưu đãi.</p></div>
      <Link href="/admin/content/offers/new" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2 font-semibold text-white">+ Tạo ưu đãi mới</Link>
    </div>
    <form className="mt-7 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-[1fr_200px_auto]" action="/admin/content/offers">
      <label className="grid gap-1 text-sm font-semibold">Tìm theo tên hoặc nhà cung cấp<Input name="q" defaultValue={q} maxLength={80} /></label>
      <label className="grid gap-1 text-sm font-semibold">Trạng thái<select name="status" defaultValue={status} className="min-h-11 rounded-lg border px-3">{statuses.map(s=><option key={s} value={s}>{labels[s]}</option>)}</select></label>
      <Button className="self-end">Lọc</Button>
    </form>
    <p className="mt-5 text-sm text-slate-600" role="status">{count} ưu đãi phù hợp</p>
    <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table className="min-w-[700px]">
        <TableHeader><TableRow><TableHead>Ưu đãi</TableHead><TableHead>Nhà cung cấp</TableHead><TableHead>Trạng thái</TableHead><TableHead>Cập nhật</TableHead><TableHead>Thao tác</TableHead></TableRow></TableHeader>
        <TableBody>{(result.data??[]).map(o=><TableRow key={o.id}><TableCell className="font-semibold">{o.title}</TableCell><TableCell>{o.provider}</TableCell><TableCell><Badge variant={badgeTone[o.status] ?? "outline"}>{labels[o.status]??o.status}</Badge></TableCell><TableCell>{new Date(o.updated_at).toLocaleDateString("vi-VN")}</TableCell><TableCell><Link className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline" href={`/admin/content/offers/${o.id}`}>Chỉnh sửa</Link></TableCell></TableRow>)}</TableBody>
      </Table>
      {!result.data?.length && <p className="p-6 text-center text-slate-600">Không tìm thấy ưu đãi. Thử thay đổi bộ lọc.</p>}
    </div>
    <nav aria-label="Phân trang ưu đãi quản trị" className="mt-5 flex items-center justify-between">
      {requestedPage > 1 ? <Link href={href(requestedPage-1)} className="rounded-xl border bg-white px-4 py-3">← Trước</Link>:<span/>}
      <span className="text-sm text-slate-600">Trang {Math.min(requestedPage,pages)} / {pages}</span>
      {requestedPage < pages ? <Link href={href(requestedPage+1)} className="rounded-xl border bg-white px-4 py-3">Sau →</Link>:<span/>}
    </nav>
  </main>;
}
