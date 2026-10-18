import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, FolderOpen, Tags } from "lucide-react";
export const metadata: Metadata = { title: "Quản lý nội dung", robots: { index: false, follow: false } };
export default function AdminContentPage() {
  return <main className="w-full px-4 py-10 sm:px-8 xl:px-10">
    <p className="text-sm font-semibold text-primary">Không gian quản trị</p>
    <h1 className="mt-2 text-3xl font-black">Quản lý nội dung</h1>
    <p className="mt-3 text-slate-600">Chọn tác vụ cần thực hiện. Mỗi khu vực quản lý được tách riêng để dễ thao tác.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <Link href="/admin/content/offers" className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Card className="h-full transition group-hover:border-blue-300 group-hover:shadow-md"><FolderOpen className="size-6 text-primary" aria-hidden="true"/><h2 className="flex items-center justify-between text-xl font-bold">Ưu đãi <ArrowUpRight className="size-5 text-primary" aria-hidden="true"/></h2>
        <p className="mt-2 text-sm text-slate-600">Tìm kiếm, lọc, tạo bản nháp và cập nhật ưu đãi.</p></Card>
      </Link>
      <Link href="/admin/content/categories" className="rounded-2xl border bg-white p-6 shadow-sm transition hover:border-primary">
        <Card className="h-full transition group-hover:border-blue-300 group-hover:shadow-md"><Tags className="size-6 text-primary" aria-hidden="true"/><h2 className="flex items-center justify-between text-xl font-bold">Danh mục <ArrowUpRight className="size-5 text-primary" aria-hidden="true"/></h2>
        <p className="mt-2 text-sm text-slate-600">Tạo mới, chỉnh sửa, thay đổi thứ tự hiển thị.</p></Card>
      </Link>
    </div>
  </main>;
}
