import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Quản lý nội dung", robots: { index: false, follow: false } };
export default function AdminContentPage() {
  return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <p className="text-sm font-semibold text-primary">Content management</p>
    <h1 className="mt-2 text-3xl font-black">Quản lý nội dung</h1>
    <p className="mt-3 text-slate-600">Chọn tác vụ cần thực hiện. Mỗi khu vực quản lý được tách riêng để dễ thao tác.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <Link href="/admin/content/offers" className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-primary">
        <h2 className="text-xl font-bold">Ưu đãi →</h2>
        <p className="mt-2 text-sm text-slate-600">Tìm kiếm, lọc, tạo bản nháp và cập nhật ưu đãi.</p>
      </Link>
      <Link href="/admin/content/categories" className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-primary">
        <h2 className="text-xl font-bold">Danh mục →</h2>
        <p className="mt-2 text-sm text-slate-600">Tạo mới, chỉnh sửa, thay đổi thứ tự hiển thị.</p>
      </Link>
    </div>
  </main>;
}
