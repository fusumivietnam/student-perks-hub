import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { reviewStudentVerification } from "@/app/admin/verifications/actions";
import { getCurrentAdmin } from "@/lib/admin";
import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Xác minh sinh viên | Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type AdminVerificationsPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
};

const statusCopy = {
  pending: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-700",
    Icon: Clock3,
  },
  verified: {
    label: "Đã xác minh",
    className: "bg-emerald-50 text-emerald-700",
    Icon: BadgeCheck,
  },
  rejected: {
    label: "Từ chối",
    className: "bg-red-50 text-red-700",
    Icon: XCircle,
  },
  expired: {
    label: "Hết hạn",
    className: "bg-slate-100 text-slate-700",
    Icon: Clock3,
  },
} as const;

type StatusFilter = "all" | keyof typeof statusCopy;

const filters: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "verified", label: "Đã xác minh" },
  { value: "rejected", label: "Từ chối" },
  { value: "expired", label: "Hết hạn" },
];

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatusFilter(value: string | undefined): StatusFilter {
  return filters.some((item) => item.value === value) ? (value as StatusFilter) : "all";
}

function effectiveStatus(status: string, expiresAt: string | null) {
  if (
    status === "verified" &&
    expiresAt &&
    new Date(expiresAt).getTime() <= Date.now()
  ) {
    return "expired" as const;
  }
  return status as keyof typeof statusCopy;
}

export default async function AdminVerificationsPage({
  searchParams,
}: AdminVerificationsPageProps) {
  const [auth, params] = await Promise.all([getCurrentAuth(), searchParams]);
  if (!auth) redirect("/login?next=/admin/verifications");

  const admin = await getCurrentAdmin();
  if (!admin) notFound();

  const filter = parseStatusFilter(one(params.status));
  const keyword = (one(params.q) ?? "").trim().slice(0,80).replace(/[%,().]/g,"");
  const page = Math.min(10000, Math.max(1, Number.parseInt(one(params.page) ?? "1",10) || 1));
  const href = (status: StatusFilter, p = 1) => {
    const qs = new URLSearchParams();
    if(status !== "all") qs.set("status",status);
    if(keyword) qs.set("q",keyword);
    if(p > 1) qs.set("page",String(p));
    return qs.size ? "/admin/verifications?" + qs.toString() : "/admin/verifications";
  };
  const supabase = await createClient();

  let listQuery = supabase
    .from("student_verifications")
    .select(
      "id,user_id,verification_email,institution_name,status,created_at,reviewed_at,expires_at",
    )
    .order("created_at", { ascending: false })
    .order("id",{ascending:false}).range((page-1)*20,page*20-1);

  if (filter !== "all") {
    listQuery = listQuery.eq("status", filter);
  }

  if(keyword) listQuery = listQuery.or("institution_name.ilike.%" + keyword + "%,verification_email.ilike.%" + keyword + "%");
  let totalQuery = supabase.from("student_verifications").select("id",{count:"exact",head:true});
  if(filter !== "all") totalQuery = totalQuery.eq("status",filter);
  if(keyword) totalQuery = totalQuery.or("institution_name.ilike.%" + keyword + "%,verification_email.ilike.%" + keyword + "%");
  const [{ data: verifications, error }, { count: pendingCount, error: pendingError }, { count: total, error: totalError }] =
    await Promise.all([
      listQuery,
      supabase
        .from("student_verifications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      totalQuery,
    ]);

  if (error) throw new Error("Could not load student verifications");
  if (pendingError || totalError) throw new Error("Could not load verification counts");

  const items = verifications ?? [];
  const totalPages = Math.max(1, Math.ceil((total ?? 0)/20));

  return (
    <main className="w-full px-4 py-10 sm:px-8 xl:px-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Quản trị
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Quản trị</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Xác minh sinh viên</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Xét duyệt dựa trên email tài khoản và tên tổ chức giáo dục do người dùng khai báo.
            MVP không lưu ảnh, giấy tờ hay mã số sinh viên.
          </p>
        </div>
        <div className="rounded-2xl border bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong className="text-xl">{pendingCount ?? 0}</strong> yêu cầu đang chờ
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Lọc yêu cầu xác minh">
        {filters.map((item) => {
          const active = filter === item.value;
          const link = href(item.value);

          return (
            <Link
              key={item.value}
              href={link}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action="/admin/verifications" className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4">
        {filter !== "all" ? <input type="hidden" name="status" value={filter} /> : null}
        <label className="grid min-w-48 flex-1 gap-1 text-sm font-semibold">Tìm trường hoặc email
          <Input name="q" defaultValue={keyword} maxLength={80} />
        </label>
        <Button>Tìm kiếm</Button>
      </form>
      <p className="mt-3 text-xs text-slate-500" aria-live="polite">
        Hiển thị {items.length} / {total ?? 0} yêu cầu phù hợp{filter === "all" ? "" : ` trong trạng thái “${statusCopy[filter].label}”`}.
      </p>

      <section className="mt-6 grid gap-4">
        {items.length ? (
          items.map((verification) => {
            const resolvedStatus = effectiveStatus(
              verification.status,
              verification.expires_at,
            );
            const status = statusCopy[resolvedStatus];
            const StatusIcon = status.Icon;

            return (
              <article key={verification.id}><Card className="gap-0">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-950">
                        {verification.institution_name}
                      </h2>
                      <Badge variant={resolvedStatus === "verified" ? "success" : resolvedStatus === "pending" ? "warning" : resolvedStatus === "rejected" ? "destructive" : "secondary"} className="gap-1">
                        <StatusIcon className="size-3.5" aria-hidden="true" />
                        {status.label}
                      </Badge>
                    </div>
                    <p className="mt-2 break-all text-sm text-slate-600">
                      {verification.verification_email}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                      <span>User: {verification.user_id}</span>
                      <span>
                        Gửi: {new Intl.DateTimeFormat("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(verification.created_at))}
                      </span>
                      {verification.reviewed_at ? (
                        <span>
                          Duyệt: {new Intl.DateTimeFormat("vi-VN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(verification.reviewed_at))}
                        </span>
                      ) : null}
                      {verification.expires_at ? (
                        <span>
                          Hết hiệu lực: {new Intl.DateTimeFormat("vi-VN", {
                            dateStyle: "medium",
                          }).format(new Date(verification.expires_at))}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {verification.status === "pending" ? (
                      <>
                        <form action={reviewStudentVerification}>
                          <input
                            type="hidden"
                            name="verificationId"
                            value={verification.id}
                          />
                          <input type="hidden" name="status" value="verified" />
                          <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                            <ShieldCheck className="size-4" aria-hidden="true" />
                            Xác minh 1 năm
                          </button>
                        </form>
                        <form action={reviewStudentVerification}>
                          <input
                            type="hidden"
                            name="verificationId"
                            value={verification.id}
                          />
                          <input type="hidden" name="status" value="rejected" />
                          <button className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700">
                            Từ chối
                          </button>
                        </form>
                      </>
                    ) : null}
                    {verification.status === "verified" && resolvedStatus === "verified" ? (
                      <form action={reviewStudentVerification}>
                        <input
                          type="hidden"
                          name="verificationId"
                          value={verification.id}
                        />
                        <input type="hidden" name="status" value="expired" />
                        <button className="rounded-xl border px-3 py-2 text-sm font-semibold text-slate-700">
                          Đánh dấu hết hạn
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </Card></article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed bg-slate-50 p-10 text-center">
            <ShieldCheck className="mx-auto size-9 text-slate-400" aria-hidden="true" />
            <p className="mt-3 font-semibold">
              {filter === "all"
                ? "Chưa có yêu cầu xác minh."
                : `Không có yêu cầu ở trạng thái “${statusCopy[filter].label}”.`}
            </p>
            {filter !== "all" ? (
              <Link
                href="/admin/verifications"
                className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Xem tất cả yêu cầu
              </Link>
            ) : null}
          </div>
        )}
      </section>
      {totalPages > 1 ? <nav aria-label="Phân trang xác minh" className="mt-6 flex items-center justify-between">
        {page > 1 ? <Link href={href(filter,page-1)} className="rounded-xl border bg-white px-4 py-3">← Trước</Link> : <span />}
        <span>Trang {page} / {totalPages}</span>
        {page < totalPages ? <Link href={href(filter,page+1)} className="rounded-xl border bg-white px-4 py-3">Sau →</Link> : <span />}
      </nav> : null}
    </main>
  );
}
