import type { Metadata } from "next";
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

function slugSuggestion(provider: string, title: string) {
  return `${provider}-${title}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();
  const [submissionsResult, categoriesResult, offersResult] = await Promise.all([
    supabase
      .from("submissions")
      .select(
        "id,provider,title,official_url,description,submitter_note,status,review_note,reviewed_at,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("categories")
      .select("id,name")
      .order("sort_order")
      .order("name"),
    supabase
      .from("offers")
      .select("id,source_submission_id,slug")
      .not("source_submission_id", "is", null),
  ]);

  if (submissionsResult.error || categoriesResult.error || offersResult.error) {
    throw new Error("Could not load submission moderation data");
  }

  const offersBySubmission = new Map(
    (offersResult.data ?? [])
      .filter((offer) => offer.source_submission_id)
      .map((offer) => [offer.source_submission_id as string, offer]),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Administration</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">
        Submission moderation
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        Review pending community submissions with stale-state protection. Approved submissions can be converted once into a traceable draft offer.
      </p>

      <div className="mt-8 grid gap-4">
        {submissionsResult.data?.length ? (
          submissionsResult.data.map((submission) => {
            const linkedOffer = offersBySubmission.get(submission.id);
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
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Official link
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                    {submission.status}
                  </span>
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
                        placeholder="Optional feedback visible to the submitter"
                        className="rounded-lg border bg-white px-3 py-2"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        name="status"
                        value="approved"
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        name="status"
                        value="rejected"
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700"
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
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white sm:col-span-2">
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
          <p className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
            No submissions.
          </p>
        )}
      </div>
    </main>
  );
}
