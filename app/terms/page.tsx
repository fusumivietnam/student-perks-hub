import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: "Điều khoản sử dụng Student Perks Hub và thông tin ưu đãi.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms", title: "Điều khoản sử dụng" },
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Pháp lý</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        Điều khoản sử dụng
      </h1>
      <p className="mt-4 text-sm text-slate-500">Cập nhật: 02/10/2026</p>

      <div className="mt-8 space-y-8 leading-7 text-slate-700">
        <section>
          <h2 className="text-xl font-bold text-slate-950">Mục đích dịch vụ</h2>
          <p className="mt-2">
            Student Perks Hub là thư mục thông tin giúp người dùng tìm các ưu đãi
            và tài nguyên giáo dục. Nội dung được tổng hợp và tóm tắt để dẫn bạn
            đến nguồn chính thức; Student Perks Hub không phải là bên cung cấp các
            ưu đãi đó.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-950">Điều kiện ưu đãi</h2>
          <p className="mt-2">
            Nhà cung cấp quyết định điều kiện, phạm vi, thời hạn và khả năng áp
            dụng của từng ưu đãi. Thông tin có thể thay đổi sau lần xác minh gần
            nhất, vì vậy bạn cần kiểm tra lại trên trang chính thức trước khi đăng
            ký hoặc thanh toán.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-950">Tài khoản và sử dụng hợp lệ</h2>
          <p className="mt-2">
            Bạn chịu trách nhiệm bảo vệ thông tin đăng nhập và không được cố gắng
            vượt qua kiểm soát truy cập, Row Level Security hoặc các cơ chế bảo
            mật khác của dịch vụ.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-950">Submission của cộng đồng</h2>
          <p className="mt-2">
            Submission không được publish trực tiếp. Việc gửi đề xuất không bảo
            đảm nội dung sẽ được chấp nhận; nội dung phải được kiểm tra trước khi
            xuất hiện như một ưu đãi đã publish.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-950">Liên kết và dịch vụ bên ngoài</h2>
          <p className="mt-2">
            Khi bạn mở trang chính thức của nhà cung cấp, các điều khoản của bên
            đó áp dụng. Student Perks Hub không kiểm soát hoạt động, giá, điều kiện
            hay tính liên tục của dịch vụ bên ngoài.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-950">Thay đổi</h2>
          <p className="mt-2">
            Nội dung và điều khoản có thể được cập nhật khi chức năng hoặc cách
            vận hành của dự án thay đổi. Ngày cập nhật gần nhất được hiển thị trên
            trang này.
          </p>
        </section>
      </div>
    </article>
  );
}
