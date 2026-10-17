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
  const supabase = await createClient();

  let listQuery = supabase
    .from("student_verifications")
    .select(
      "id,user_id,verification_email,institution_name,status,created_at,reviewed_at,expires_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter !== "all") {
    listQuery = listQuery.eq("status", filter);
  }

  const [{ data: verifications, error }, { count: pendingCount, error: pendingError }] =
    await Promise.all([
      listQuery,
      supabase
        .from("student_verifications")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  if (error) throw new Error("Could not load student verifications");
  if (pendingError) throw new Error("Could not load pending verification count");

  const items = verifications ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Moderation console
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Administration</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Xác minh sinh viên</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Review dựa trên email tài khoản và tên tổ chức giáo dục do người dùng khai báo.
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
          const href = item.value === "all" ? "/admin/verifications" : `/admin/verifications?status=${item.value}`;

          return (
            <Link
              key={item.value}
              href={href}
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

      <p className="mt-3 text-xs text-slate-500" aria-live="polite">
        Hiển thị {items.length} yêu cầu gần nhất{filter === "all" ? "" : ` trong trạng thái “${statusCopy[filter].label}”`}.
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
              <article
                key={verification.id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-950">
                        {verification.institution_name}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                      >
                        <StatusIcon className="size-3.5" aria-hidden="true" />
                        {status.label}
                      </span>
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
                          Review: {new Intl.DateTimeFormat("vi-VN", {
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
              </article>
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
    </main>
  );
}
