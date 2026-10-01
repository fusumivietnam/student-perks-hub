import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <p className="font-bold">Student Perks Hub</p>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Tổng hợp ưu đãi và tài nguyên giúp sinh viên học tập, sáng tạo và phát triển với chi phí hợp lý hơn.
          </p>
        </div>
        <div className="flex gap-6 text-sm md:justify-end">
          <Link href="/about">Giới thiệu</Link>
          <Link href="/privacy">Quyền riêng tư</Link>
          <Link href="/terms">Điều khoản</Link>
        </div>
      </div>
    </footer>
  );
}
