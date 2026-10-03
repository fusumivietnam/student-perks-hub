import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  Bookmark,
  CheckCircle2,
  Clock3,
  FileText,
  LockKeyhole,
  Send,
} from "lucide-react";
import { redirect } from "next/navigation";

import { updatePassword } from "@/app/account/actions";
import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tài khoản",
  robots: { index: false, follow: false },
};

type AccountPageProps = {
  searchParams: Promise<{
    success?: string | string[];
    error?: string | string[];
  }>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const submissionStatus = {
  pending: {
    label: "Đang chờ duyệt",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Đã duyệt",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Không được duyệt",
    className: "border-red-200 bg-red-50 text-red-700",
  },
} as const;

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const [auth, params] = await Promise.all([getCurrentAuth(), searchParams]);
  if (!auth) redirect("/login?next=/account");

  const supabase = await createClient();
  const [bookmarksResult, submissionsResult, verificationResult] = await Promise.all([
    supabase
      .from("bookmarks")
      .select("offer_id", { count: "exact", head: true })
      .eq("user_id", auth.id),
    supabase
      .from("submissions")
      .select("id,provider,title,status,created_at")
      .eq("submitter_user_id", auth.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("student_verifications")
      .select("status")
      .eq("user_id", auth.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (bookmarksResult.error || submissionsResult.error || verificationResult.error) {
    throw new Error("Could not load account data");
  }

  const submissions = submissionsResult.data ?? [];
  const pendingCount = submissions.filter((item) => item.status === "pending").length;
  const verificationStatus = verificationResult.data?.status ?? "Chưa xác minh";
  const verificationLabel =
    verificationStatus === "verified"
      ? "Đã xác minh"
      : verificationStatus === "pending"
        ? "Đang chờ duyệt"
        : verificationStatus === "rejected"
          ? "Cần gửi lại"
          : verificationStatus === "expired"
            ? "Đã hết hạn"
            : "Chưa xác minh";
  const success = one(params.success);
  const error = one(params.error);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Tài khoản</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Trung tâm tài khoản
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Theo dõi ưu đãi đã lưu, đề xuất đã gửi, trạng thái xác minh và các thiết lập bảo mật của bạn.
          </p>
        </div>
        <div className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email đăng nhập</p>
          <p className="mt-1 font-semibold text-slate-900">{auth.email ?? "Không có email"}</p>
        </div>
      </div>

      {success ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/saved" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-primary">
              <Bookmark className="size-5" aria-hidden="true" />
            </span>
            <span className="text-2xl font-black">{bookmarksResult.count ?? 0}</span>
          </div>
          <p className="mt-4 font-bold">Ưu đãi đã lưu</p>
          <p className="mt-1 text-sm text-slate-500">Mở danh sách bookmark của bạn.</p>
        </Link>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <span className="text-2xl font-black">{submissions.length}</span>
          </div>
          <p className="mt-4 font-bold">Đề xuất đã gửi</p>
          <p className="mt-1 text-sm text-slate-500">Tối đa 20 đề xuất gần nhất.</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 className="size-5" aria-hidden="true" />
            </span>
            <span className="text-2xl font-black">{pendingCount}</span>
          </div>
          <p className="mt-4 font-bold">Đang chờ duyệt</p>
          <p className="mt-1 text-sm text-slate-500">Đề xuất chưa có quyết định cuối.</p>
        </div>

        <Link href="/verification" className="rounded-2xl border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <BadgeCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="text-right text-sm font-bold text-slate-700">{verificationLabel}</span>
          </div>
          <p className="mt-4 font-bold">Xác minh sinh viên</p>
          <p className="mt-1 text-sm text-slate-500">Quản lý trạng thái và thời hạn xác minh.</p>
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">Submission</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">Đề xuất của bạn</h2>
            </div>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Send className="size-4" aria-hidden="true" />
              Gửi ưu đãi mới
            </Link>
          </div>

          {submissions.length ? (
            <div className="mt-6 divide-y">
              {submissions.map((submission) => {
                const status = submissionStatus[submission.status as keyof typeof submissionStatus];
                return (
                  <article key={submission.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <p className="text-sm text-slate-500">{submission.provider}</p>
                        <h3 className="mt-1 font-bold text-slate-950">{submission.title}</h3>
                        <p className="mt-2 text-xs text-slate-400">
                          Gửi ngày {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(submission.created_at))}
                        </p>
                      </div>
                      <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${status?.className ?? "bg-slate-50 text-slate-600"}`}>
                        {status?.label ?? submission.status}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
              <FileText className="mx-auto size-8 text-slate-400" aria-hidden="true" />
              <p className="mt-3 font-semibold">Bạn chưa gửi đề xuất nào.</p>
              <p className="mt-1 text-sm text-slate-500">Nếu tìm thấy ưu đãi chính thức, hãy gửi link để đội ngũ kiểm tra.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">Bảo mật</p>
              <h2 className="font-bold">Đổi mật khẩu</h2>
            </div>
          </div>

          <form action={updatePassword} className="mt-6 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium">
              Mật khẩu mới
              <input
                type="password"
                name="password"
                minLength={8}
                maxLength={128}
                required
                autoComplete="new-password"
                className="rounded-xl border px-3 py-2.5"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Xác nhận mật khẩu
              <input
                type="password"
                name="confirmPassword"
                minLength={8}
                maxLength={128}
                required
                autoComplete="new-password"
                className="rounded-xl border px-3 py-2.5"
              />
            </label>
            <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
              Cập nhật mật khẩu
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}
