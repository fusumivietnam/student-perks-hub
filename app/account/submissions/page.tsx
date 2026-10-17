import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileText, Send, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { cancelSubmission } from "@/app/account/actions";
import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Đề xuất của tôi",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const statusConfig = {
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
  cancelled: {
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
} as const;

type SubmissionStatus = keyof typeof statusConfig;
type StatusFilter = "all" | SubmissionStatus;

type AccountSubmissionsPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    submitted?: string | string[];
    cancelled?: string | string[];
    error?: string | string[];
  }>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value: string | undefined): StatusFilter {
  return value && value in statusConfig ? (value as SubmissionStatus) : "all";
}

const errorCopy: Record<string, string> = {
  "invalid-cancel": "Yêu cầu hủy không hợp lệ.",
  "cancel-failed": "Chưa thể hủy đề xuất lúc này. Vui lòng thử lại.",
  "not-cancellable": "Đề xuất đã được xử lý hoặc không còn có thể hủy.",
};

const filters: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Không duyệt" },
  { value: "cancelled", label: "Đã hủy" },
];

export default async function AccountSubmissionsPage({
  searchParams,
}: AccountSubmissionsPageProps) {
  const [auth, params] = await Promise.all([getCurrentAuth(), searchParams]);
  if (!auth) redirect("/login?next=/account/submissions");

  const activeStatus = parseStatus(one(params.status));
  const submitted = one(params.submitted);
  const cancelled = one(params.cancelled);
  const errorCode = one(params.error);

  const supabase = await createClient();
  let submissionsQuery = supabase
    .from("submissions")
    .select(
      "id,provider,title,official_url,status,review_note,reviewed_at,created_at,updated_at",
    )
    .eq("submitter_user_id", auth.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (activeStatus !== "all") {
    submissionsQuery = submissionsQuery.eq("status", activeStatus);
  }

  const countQuery = (status?: SubmissionStatus) => {
    let query = supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("submitter_user_id", auth.id);
    if (status) query = query.eq("status", status);
    return query;
  };

  const [
    submissionsResult,
    allCountResult,
    pendingCountResult,
    approvedCountResult,
    rejectedCountResult,
    cancelledCountResult,
  ] = await Promise.all([
    submissionsQuery,
    countQuery(),
    countQuery("pending"),
    countQuery("approved"),
    countQuery("rejected"),
    countQuery("cancelled"),
  ]);

  if (
    submissionsResult.error ||
    allCountResult.error ||
    pendingCountResult.error ||
    approvedCountResult.error ||
    rejectedCountResult.error ||
    cancelledCountResult.error
  ) {
    throw new Error("Could not load submissions");
  }

  const counts: Record<StatusFilter, number> = {
    all: allCountResult.count ?? 0,
    pending: pendingCountResult.count ?? 0,
    approved: approvedCountResult.count ?? 0,
    rejected: rejectedCountResult.count ?? 0,
    cancelled: cancelledCountResult.count ?? 0,
  };
  const submissions = submissionsResult.data ?? [];

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Tài khoản</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Đề xuất của tôi
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Theo dõi vòng đời từng đề xuất, phản hồi kiểm duyệt và trạng thái xử lý. Bạn có thể hủy đề xuất khi nó vẫn đang chờ duyệt.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Send className="size-4" aria-hidden="true" />
          Gửi ưu đãi mới
        </Link>
      </div>

      {submitted ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          role="status"
        >
          Đã nhận đề xuất. Trạng thái ban đầu là chờ duyệt; mọi phản hồi tiếp theo sẽ xuất hiện tại đây.
        </div>
      ) : null}

      {cancelled ? (
        <div
          className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
          role="status"
        >
          Đề xuất đã được hủy.
        </div>
      ) : null}

      {errorCode ? (
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {errorCopy[errorCode] ?? "Không thể cập nhật đề xuất lúc này."}
        </div>
      ) : null}

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Lọc đề xuất theo trạng thái">
        {filters.map((filter) => {
          const active = filter.value === activeStatus;
          const href =
            filter.value === "all"
              ? "/account/submissions"
              : `/account/submissions?status=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
              }`}
            >
              {filter.label} ({counts[filter.value]})
            </Link>
          );
        })}
      </nav>

      {submissions.length ? (
        <div className="mt-6 grid gap-4">
          {submissions.map((submission) => {
            const status = statusConfig[submission.status as SubmissionStatus] ?? {
              label: submission.status,
              className: "border-slate-200 bg-slate-50 text-slate-600",
            };

            return (
              <article key={submission.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">{submission.provider}</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-950">{submission.title}</h2>
                    <a
                      href={submission.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-6 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Link chính thức
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 border-t pt-4 text-sm text-slate-600 sm:grid-cols-2">
                  <p>
                    Gửi ngày {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(submission.created_at))}
                  </p>
                  {submission.reviewed_at ? (
                    <p>
                      Duyệt ngày {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(submission.reviewed_at))}
                    </p>
                  ) : submission.status === "pending" ? (
                    <p>Đang chờ phản hồi kiểm duyệt</p>
                  ) : null}
                </div>

                {submission.review_note ? (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Phản hồi kiểm duyệt</p>
                    <p className="mt-1 leading-6">{submission.review_note}</p>
                  </div>
                ) : null}

                {submission.status === "pending" ? (
                  <form action={cancelSubmission} className="mt-4">
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <button className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50">
                      <XCircle className="size-4" aria-hidden="true" />
                      Hủy đề xuất
                    </button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed bg-slate-50 p-10 text-center">
          <FileText className="mx-auto size-8 text-slate-400" aria-hidden="true" />
          <p className="mt-3 font-semibold">
            {activeStatus === "all"
              ? "Bạn chưa gửi đề xuất nào."
              : "Không có đề xuất ở trạng thái này."}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {activeStatus === "all"
              ? "Nếu tìm thấy ưu đãi chính thức, hãy gửi link để đội ngũ kiểm tra."
              : "Chọn trạng thái khác hoặc gửi một ưu đãi mới."}
          </p>
          {activeStatus !== "all" ? (
            <Link
              href="/account/submissions"
              className="mt-4 inline-flex rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Xem tất cả đề xuất
            </Link>
          ) : null}
        </div>
      )}
    </section>
  );
}
