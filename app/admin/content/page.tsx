import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { getCurrentAdmin } from "@/lib/admin";
import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quản lý nội dung", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login?next=/admin/content");
  if (!(await getCurrentAdmin())) notFound();
  const supabase = await createClient();
  const categoriesResult = await supabase
  .from("categories").select("id,slug,name,description,sort_order").order("sort_order").order("name");
  if (categoriesResult.error) throw new Error("Could not load admin content");
  const categories = categoriesResult.data ?? [];
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Content management</p>
      <h1 className="mt-2 text-3xl font-black">Quản lý nội dung</h1>
      <p className="mt-3 text-sm text-slate-600">Biên tập danh mục và ưu đãi. Chỉ những thay đổi được lưu mới có hiệu lực.</p>
      <section className="mt-12">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">Content management</p>
            <h2 className="mt-1 text-2xl font-bold">Categories</h2>
          </div>
          <p className="text-sm text-slate-500">{categories.length} danh mục</p>
        </div>

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
          <button className="min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-4">
            Create category
          </button>
        </form>

        <div className="mt-4 grid gap-3">
          {categories.map((category) => (
            <form
              key={category.id}
              action={saveCategory}
              className="grid gap-2 rounded-xl border p-4 md:grid-cols-5"
            >
              <input type="hidden" name="id" value={category.id} />
              <input name="slug" defaultValue={category.slug} className="rounded-lg border px-3 py-2" />
              <input name="name" defaultValue={category.name} className="rounded-lg border px-3 py-2" />
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
              <button className="min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold">Save</button>
              <button
                formAction={deleteCategory}
                className="min-h-11 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 md:col-start-5"
              >
                Delete
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-blue-50 p-5">
        <h2 className="text-lg font-bold">Quản lý ưu đãi</h2>
        <p className="mt-1 text-sm text-slate-600">Danh sách, bộ lọc và trình biên tập được tách riêng để thao tác nhanh và an toàn.</p>
        <Link href="/admin/content/offers" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white">Mở quản lý ưu đãi →</Link>
      </section>
    </main>
  );
}
