import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileCheck2, FilePlus2 } from "lucide-react";

import {
  createDraftFromSubmission,
  reviewSubmission,
} from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Submission moderation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const statusConfig = {
  pending: { label: "Chờ duyệt", className: "border-amber-200 bg-amber-50 text-amber-700" },
  approved: { label: "Đã duyệt", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  rejected: { label: "Từ chối", className: "border-red-200 bg-red-50 text-red-700" },
  cancelled: { label: "Đã hủy", className: "border-slate-200 bg-slate-50 text-slate-600" },
} as const;

type SubmissionStatus = keyof typeof statusConfig;
type StatusFilter = "all" | SubmissionStatus;

type AdminSubmissionsPageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

const filters: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
  { value: "cancelled", label: "Đã hủy" },
];

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseStatus(value: string | undefined): StatusFilter {
  return filters.some((item) => item.value === value) ? (value as StatusFilter) : "all";
}

function slugSuggestion(provider: string, title: string) {
  return `${provider}-${title}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

export default async function AdminSubmissionsPage({ searchParams }: AdminSubmissionsPageProps) {
  const params = await searchParams;
  const activeStatus = parseStatus(one(params.status));
  const supabase = await createClient();

  let submissionsQuery = supabase
    .from("submissions")
    .select(
      "id,provider,title,official_url,description,submitter_note,status,review_note,reviewed_at,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (activeStatus !== "all") {
    submissionsQuery = submissionsQuery.eq("status", activeStatus);
  }

  const countQuery = (status?: SubmissionStatus) => {
    let query = supabase.from("submissions").select("id", { count: "exact", head: true });
    if (status) query = query.eq("status", status);
    return query;
  };

  const [
    submissionsResult,
    categoriesResult,
    offersResult,
    allCountResult,
    pendingCountResult,
    approvedCountResult,
    rejectedCountResult,
    cancelledCountResult,
  ] = await Promise.all([
    submissionsQuery,
    supabase.from("categories").select("id,name").order("sort_order").order("name"),
    supabase
      .from("offers")
      .select("id,source_submission_id,slug")
      .not("source_submission_id", "is", null),
    countQuery(),
    countQuery("pending"),
    countQuery("approved"),
    countQuery("rejected"),
    countQuery("cancelled"),
  ]);

  if (
    submissionsResult.error ||
    categoriesResult.error ||
    offersResult.error ||
    allCountResult.error ||
    pendingCountResult.error ||
    approvedCountResult.error ||
    rejectedCountResult.error ||
    cancelledCountResult.error
  ) {
    throw new Error("Could not load submission moderation data");
  }

  const counts: Record<StatusFilter, number> = {
    all: allCountResult.count ?? 0,
    pending: pendingCountResult.count ?? 0,
    approved: approvedCountResult.count ?? 0,
    rejected: rejectedCountResult.count ?? 0,
    cancelled: cancelledCountResult.count ?? 0,
  };

  const submissions = submissionsResult.data ?? [];
  const offersBySubmission = new Map(
    (offersResult.data ?? [])
      .filter((offer) => offer.source_submission_id)
      .map((offer) => [offer.source_submission_id as string, offer]),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Administration</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Submission moderation</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Xử lý hàng đợi theo trạng thái, giữ stale-state protection và chỉ chuyển một submission đã duyệt thành một draft offer có liên kết truy vết.
          </p>
        </div>
        <div className="rounded-2xl border bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong className="text-xl">{counts.pending}</strong> đề xuất đang chờ
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Lọc submission theo trạng thái">
        {filters.map((filter) => {
          const active = filter.value === activeStatus;
          const href = filter.value === "all" ? "/admin/submissions" : `/admin/submissions?status=${filter.value}`;
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

      <p className="mt-3 text-xs text-slate-500" aria-live="polite">
        Hiển thị {submissions.length} submission gần nhất{activeStatus === "all" ? "" : ` trong trạng thái “${statusConfig[activeStatus].label}”`}.
      </p>

      <div className="mt-6 grid gap-4">
        {submissions.length ? (
          submissions.map((submission) => {
            const linkedOffer = offersBySubmission.get(submission.id);
            const status = statusConfig[submission.status as SubmissionStatus] ?? {
              label: submission.status,
              className: "border-slate-200 bg-slate-50 text-slate-600",
            };

            return (
              <article key={submission.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">{submission.provider}</p>
                    <h2 className="mt-1 text-lg font-bold">{submission.title}</h2>
                    <a
                      href={submission.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-6 items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Official link
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </div>
                  <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t pt-4 text-xs text-slate-500">
                  <span>
                    Gửi {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(submission.created_at))}
                  </span>
                  {submission.reviewed_at ? (
                    <span>
                      Duyệt {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(submission.reviewed_at))}
                    </span>
                  ) : null}
                </div>

                {submission.description ? (
                  <p className="mt-4 text-sm leading-6 text-slate-700">{submission.description}</p>
                ) : null}

                {submission.submitter_note ? (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Submitter note: </span>
                    {submission.submitter_note}
                  </div>
                ) : null}

                {submission.status === "pending" ? (
                  <form action={reviewSubmission} className="mt-5 grid gap-3 rounded-xl border bg-slate-50 p-4">
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <label className="grid gap-1.5 text-sm font-medium">
                      Review note
                      <textarea
                        name="reviewNote"
                        rows={2}
                        maxLength={1000}
                        placeholder="Phản hồi tùy chọn hiển thị cho người gửi"
                        className="rounded-lg border bg-white px-3 py-2"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        name="status"
                        value="approved"
                        className="min-h-11 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        name="status"
                        value="rejected"
                        className="min-h-11 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </form>
                ) : null}

                {submission.review_note ? (
                  <div className="mt-4 rounded-xl border p-3 text-sm text-slate-700">
                    <span className="font-semibold">Review note: </span>
                    {submission.review_note}
                  </div>
                ) : null}

                {submission.status === "approved" && !linkedOffer ? (
                  <form action={createDraftFromSubmission} className="mt-5 grid gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:grid-cols-2">
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <label className="grid gap-1.5 text-sm font-medium">
                      Draft slug
                      <input
                        name="slug"
                        required
                        defaultValue={slugSuggestion(submission.provider, submission.title)}
                        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                        className="rounded-lg border bg-white px-3 py-2"
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium">
                      Category
                      <select name="categoryId" defaultValue="" className="rounded-lg border bg-white px-3 py-2">
                        <option value="">No category</option>
                        {categoriesResult.data?.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button className="min-h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white sm:col-span-2">
                      <FilePlus2 className="size-4" aria-hidden="true" />
                      Create draft offer
                    </button>
                  </form>
                ) : null}

                {linkedOffer ? (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                    <FileCheck2 className="size-4" aria-hidden="true" />
                    Draft linked: {linkedOffer.slug}
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
            <p className="font-semibold">
              {activeStatus === "all" ? "Chưa có submission." : "Không có submission ở trạng thái này."}
            </p>
            {activeStatus !== "all" ? (
              <Link href="/admin/submissions" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
                Xem toàn bộ hàng đợi
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
