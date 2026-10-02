import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  deleteCategory,
  deleteOffer,
  reviewSubmission,
  saveCategory,
  saveOffer,
} from "@/app/admin/actions";
import { getCurrentAdmin } from "@/lib/admin";
import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Moderation console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login?next=/admin");

  const admin = await getCurrentAdmin();
  if (!admin) notFound();

  const supabase = await createClient();
  const [
    { data: submissions, error: submissionsError },
    { data: categories, error: categoriesError },
    { data: offers, error: offersError },
  ] = await Promise.all([
    supabase
      .from("submissions")
      .select("id,provider,title,official_url,status,created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("categories")
      .select("id,slug,name,description,sort_order")
      .order("sort_order")
      .order("name"),
    supabase
      .from("offers")
      .select(
        "id,slug,title,provider,summary,official_url,category_id,benefit_type,benefit_text,status,is_featured",
      )
      .order("updated_at", { ascending: false })
      .limit(100),
  ]);

  if (submissionsError || categoriesError || offersError) {
    throw new Error("Could not load admin data");
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Administration</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">
        Moderation console
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        Signed in as {admin.email ?? admin.id}. Every mutation is checked
        server-side and remains subject to database RLS.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Submissions</h2>
        <div className="mt-4 grid gap-4">
          {submissions?.length ? (
            submissions.map((submission) => (
              <article
                key={submission.id}
                className="rounded-2xl border bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {submission.provider}
                    </p>
                    <h3 className="mt-1 font-bold">{submission.title}</h3>
                    <a
                      href={submission.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-primary hover:underline"
                    >
                      Official link
                    </a>
                  </div>
                  <span className="rounded-full border px-3 py-1 text-xs font-semibold">
                    {submission.status}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <form action={reviewSubmission}>
                    <input
                      type="hidden"
                      name="submissionId"
                      value={submission.id}
                    />
                    <input type="hidden" name="status" value="approved" />
                    <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                      Approve
                    </button>
                  </form>
                  <form action={reviewSubmission}>
                    <input
                      type="hidden"
                      name="submissionId"
                      value={submission.id}
                    />
                    <input type="hidden" name="status" value="rejected" />
                    <button className="rounded-lg border px-3 py-2 text-sm font-semibold">
                      Reject
                    </button>
                  </form>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-xl border border-dashed p-6 text-sm text-slate-500">
              No submissions.
            </p>
          )}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Categories</h2>

        <form
          action={saveCategory}
          className="mt-4 grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-4"
        >
          <input
            name="slug"
            required
            placeholder="slug"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="name"
            required
            placeholder="Name"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="description"
            placeholder="Description"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="sortOrder"
            type="number"
            min="0"
            defaultValue="0"
            className="rounded-lg border px-3 py-2"
          />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-4">
            Create category
          </button>
        </form>

        <div className="mt-4 grid gap-3">
          {categories?.map((category) => (
            <form
              key={category.id}
              action={saveCategory}
              className="grid gap-2 rounded-xl border p-4 md:grid-cols-5"
            >
              <input type="hidden" name="id" value={category.id} />
              <input
                name="slug"
                defaultValue={category.slug}
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="name"
                defaultValue={category.name}
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="description"
                defaultValue={category.description ?? ""}
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={category.sort_order}
                className="rounded-lg border px-3 py-2"
              />
              <button className="rounded-lg border px-3 py-2 text-sm font-semibold">
                Save
              </button>
              <button
                formAction={deleteCategory}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 md:col-start-5"
              >
                Delete
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Offers</h2>

        <form
          action={saveOffer}
          className="mt-4 grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-2"
        >
          <input
            name="slug"
            required
            placeholder="slug"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="title"
            required
            placeholder="Title"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="provider"
            required
            placeholder="Provider"
            className="rounded-lg border px-3 py-2"
          />
          <input
            name="officialUrl"
            required
            type="url"
            placeholder="Official URL"
            className="rounded-lg border px-3 py-2"
          />
          <textarea
            name="summary"
            required
            placeholder="Summary"
            className="rounded-lg border px-3 py-2 md:col-span-2"
          />

          <select
            name="categoryId"
            className="rounded-lg border px-3 py-2"
            defaultValue=""
          >
            <option value="">No category</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="benefitType"
            defaultValue="free"
            className="rounded-lg border px-3 py-2"
          >
            <option value="free">Free</option>
            <option value="discount">Discount</option>
            <option value="credit">Credit</option>
            <option value="trial">Trial</option>
            <option value="other">Other</option>
          </select>

          <input
            name="benefitText"
            placeholder="Benefit text"
            className="rounded-lg border px-3 py-2"
          />

          <select
            name="status"
            defaultValue="draft"
            className="rounded-lg border px-3 py-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" />
            Featured
          </label>

          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-2">
            Create offer
          </button>
        </form>

        <div className="mt-4 grid gap-4">
          {offers?.map((offer) => (
            <form
              key={offer.id}
              action={saveOffer}
              className="grid gap-2 rounded-2xl border p-4 md:grid-cols-3"
            >
              <input type="hidden" name="id" value={offer.id} />
              <input
                name="slug"
                defaultValue={offer.slug}
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="title"
                defaultValue={offer.title}
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="provider"
                defaultValue={offer.provider}
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="officialUrl"
                type="url"
                defaultValue={offer.official_url}
                className="rounded-lg border px-3 py-2"
              />
              <input
                name="benefitText"
                defaultValue={offer.benefit_text ?? ""}
                className="rounded-lg border px-3 py-2"
              />
              <select
                name="categoryId"
                defaultValue={offer.category_id ?? ""}
                className="rounded-lg border px-3 py-2"
              >
                <option value="">No category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <textarea
                name="summary"
                defaultValue={offer.summary}
                className="rounded-lg border px-3 py-2 md:col-span-3"
              />

              <select
                name="benefitType"
                defaultValue={offer.benefit_type}
                className="rounded-lg border px-3 py-2"
              >
                <option value="free">Free</option>
                <option value="discount">Discount</option>
                <option value="credit">Credit</option>
                <option value="trial">Trial</option>
                <option value="other">Other</option>
              </select>

              <select
                name="status"
                defaultValue={offer.status}
                className="rounded-lg border px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={offer.is_featured}
                />
                Featured
              </label>

              <button className="rounded-lg border px-3 py-2 text-sm font-semibold">
                Save offer
              </button>
              <button
                formAction={deleteOffer}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
              >
                Delete offer
              </button>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
