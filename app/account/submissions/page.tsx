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

const statusConfig: Record<string, { label: string; className: string }> = {
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
};

export default async function AccountSubmissionsPage() {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login?next=/account/submissions");

  const supabase = await createClient();
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select(
      "id,provider,title,official_url,status,review_note,reviewed_at,created_at,updated_at",
    )
    .eq("submitter_user_id", auth.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error("Could not load submissions");

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Tài khoản</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Đề xuất của tôi
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Theo dõi vòng đời từng đề xuất. Bạn có thể hủy đề xuất khi nó vẫn đang chờ duyệt.
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

      {submissions?.length ? (
        <div className="mt-8 grid gap-4">
          {submissions.map((submission) => {
            const status = statusConfig[submission.status] ?? {
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
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
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
        <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 p-10 text-center">
          <FileText className="mx-auto size-8 text-slate-400" aria-hidden="true" />
          <p className="mt-3 font-semibold">Bạn chưa gửi đề xuất nào.</p>
          <p className="mt-1 text-sm text-slate-500">
            Nếu tìm thấy ưu đãi chính thức, hãy gửi link để đội ngũ kiểm tra.
          </p>
        </div>
      )}
    </section>
  );
}
