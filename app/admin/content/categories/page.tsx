import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { saveCategory } from "@/app/admin/actions";
import { getCurrentAdmin } from "@/lib/admin";
import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quản lý danh mục", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login?next=/admin/content/categories");
  if (!(await getCurrentAdmin())) notFound();
  const supabase = await createClient();
  const categoriesResult = await supabase
  .from("categories").select("id,slug,name,description,sort_order").order("sort_order").order("name");
  if (categoriesResult.error) throw new Error("Could not load admin content");
  const categories = categoriesResult.data ?? [];
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Quản lý nội dung</p>
      <h1 className="mt-2 text-3xl font-black">Quản lý danh mục</h1>
      <p className="mt-3 text-sm text-slate-600">Tạo và cập nhật danh mục. Không cung cấp xóa vĩnh viễn trong giao diện thông thường.</p>
      <section className="mt-8">
        <h2 className="text-xl font-bold">Thêm danh mục</h2>
        <Card className="mt-4 gap-0"><form action={saveCategory} className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold">Tên danh mục<Input name="name" required minLength={2} maxLength={120} className="" /></label>
          <label className="grid gap-1 text-sm font-semibold">Slug<Input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} className="" /></label>
          <label className="grid gap-1 text-sm font-semibold sm:col-span-2">Mô tả<Input name="description" maxLength={500} className="" /></label>
          <label className="grid gap-1 text-sm font-semibold">Thứ tự hiển thị<Input name="sortOrder" type="number" min="0" max="10000" defaultValue="0" className="" /></label>
          <Button className="self-end">Tạo danh mục</Button>
        </form></Card>
      </section>
      <section className="mt-9">
        <h2 className="text-xl font-bold">Danh sách danh mục ({categories.length})</h2>
        <div className="mt-4 grid gap-3">
          {categories.map(category => (
            <Card key={category.id} className="gap-0"><form action={saveCategory} className="grid gap-3 sm:grid-cols-2">
              <Input type="hidden" name="id" value={category.id} />
              <label className="grid gap-1 text-sm font-semibold">Tên danh mục<Input name="name" required minLength={2} maxLength={120} defaultValue={category.name} className="" /></label>
              <label className="grid gap-1 text-sm font-semibold">Slug<Input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} defaultValue={category.slug} className="" /></label>
              <label className="grid gap-1 text-sm font-semibold sm:col-span-2">Mô tả<Input name="description" maxLength={500} defaultValue={category.description ?? ""} className="" /></label>
              <label className="grid gap-1 text-sm font-semibold">Thứ tự hiển thị<Input name="sortOrder" type="number" min="0" max="10000" defaultValue={category.sort_order} className="" /></label>
              <Button variant="outline" className="self-end">Lưu thay đổi</Button>
            </form></Card>
          ))}
          {!categories.length && <p className="rounded-2xl border border-dashed p-7 text-center text-slate-600">Chưa có danh mục. Tạo danh mục đầu tiên ở phía trên.</p>}
        </div>
      </section>
    </main>
  );
}
