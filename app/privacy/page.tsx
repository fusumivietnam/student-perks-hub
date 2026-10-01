import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quyền riêng tư",
  description: "Cách Student Perks Hub xử lý dữ liệu tài khoản, bookmark và submission.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy", title: "Quyền riêng tư" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Pháp lý</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        Quyền riêng tư
      </h1>
      <p className="mt-4 text-sm text-slate-500">Cập nhật: 02/10/2026</p>

      <div className="mt-8 space-y-8 leading-7 text-slate-700">
        <section>
          <h2 className="text-xl font-bold text-slate-950">Dữ liệu được xử lý</h2>
          <p className="mt-2">
            Khi bạn tạo tài khoản hoặc đăng nhập, hệ thống xác thực xử lý thông tin
            tài khoản như email và định danh người dùng. Khi bạn lưu ưu đãi, hệ
            thống lưu quan hệ giữa tài khoản và ưu đãi. Khi bạn gửi đề xuất, hệ
            thống lưu nội dung submission; nếu đang đăng nhập, submission có thể
            được gắn với tài khoản của bạn.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-950">Mục đích sử dụng</h2>
          <p className="mt-2">
            Dữ liệu được dùng để cung cấp đăng nhập, bookmark, theo dõi submission,
            bảo vệ quyền truy cập và vận hành các tính năng của Student Perks Hub.
            Dữ liệu quản trị được lưu riêng và không dựa trên metadata mà người
            dùng có thể tự chỉnh sửa.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-950">Nhà cung cấp hạ tầng</h2>
          <p className="mt-2">
            Ứng dụng sử dụng Supabase cho cơ sở dữ liệu và xác thực. Môi trường
            triển khai có thể tạo log kỹ thuật cần thiết để vận hành và bảo mật.
            Student Perks Hub không đưa khóa bí mật production vào mã nguồn công
            khai.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-950">Liên kết bên ngoài</h2>
          <p className="mt-2">
            Các ưu đãi dẫn đến trang chính thức của nhà cung cấp. Khi rời Student
            Perks Hub, chính sách quyền riêng tư của nhà cung cấp đó sẽ áp dụng.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-950">Lưu giữ và quyền của bạn</h2>
          <p className="mt-2">
            Dữ liệu được giữ trong thời gian cần thiết để cung cấp tính năng tương
            ứng và bảo đảm tính toàn vẹn của dịch vụ. Khi có kênh hỗ trợ chính
            thức được công bố, bạn có thể dùng kênh đó để yêu cầu hỗ trợ liên quan
            đến dữ liệu tài khoản.
          </p>
        </section>
      </div>
    </article>
  );
}
