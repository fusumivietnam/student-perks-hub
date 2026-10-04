import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quyền riêng tư",
  description: "Cách Student Perks Hub xử lý dữ liệu tài khoản, bookmark, submission và dữ liệu vận hành.",
};

const sections = [
  {
    title: "Dữ liệu chúng tôi xử lý",
    paragraphs: [
      "Khi bạn chỉ duyệt các ưu đãi công khai, ứng dụng không yêu cầu bạn tạo tài khoản. Hạ tầng lưu trữ và cơ sở dữ liệu vẫn có thể xử lý metadata kỹ thuật tiêu chuẩn cần thiết để phục vụ và bảo vệ yêu cầu web.",
      "Nếu bạn đăng nhập, Supabase Auth xử lý thông tin xác thực và định danh tài khoản. Các bảng ứng dụng có thể lưu hồ sơ như tên hiển thị hoặc ảnh đại diện, các ưu đãi bạn đã lưu và mã định danh tài khoản liên quan. Ứng dụng không chủ ý ghi mật khẩu của bạn vào các bảng ứng dụng.",
      "Khi bạn gửi một ưu đãi, chúng tôi lưu các trường bạn cung cấp như nhà cung cấp, tiêu đề, URL chính thức, mô tả và ghi chú. Nếu bạn đang đăng nhập, submission có thể được liên kết với tài khoản của bạn; submission ẩn danh không có liên kết tài khoản.",
    ],
  },
  {
    title: "Mục đích sử dụng",
    paragraphs: [
      "Dữ liệu được dùng để vận hành đăng nhập, hồ sơ, bookmark, tiếp nhận và kiểm duyệt submission, hiển thị nội dung đã được duyệt, bảo vệ hệ thống, xử lý sự cố và cải thiện độ tin cậy của dịch vụ.",
      "Chúng tôi không bán dữ liệu cá nhân và hiện không triển khai quảng cáo hành vi hoặc hệ thống analytics bên thứ ba cho mục đích quảng cáo.",
    ],
  },
  {
    title: "Cookie, session và log vận hành",
    paragraphs: [
      "Tính năng đăng nhập có thể sử dụng cookie cần thiết để duy trì phiên xác thực. Nếu không đăng nhập, ứng dụng không chủ ý đặt cookie quảng cáo.",
      "Log ứng dụng phía server được giới hạn cho thông tin vận hành như loại lỗi, phương thức HTTP, đường dẫn không gồm query string, environment, release SHA, deployment ID và region. Thiết kế logging hiện tại cố ý loại trừ request body, cookie, authorization header, query string, session value và secret. Nhà cung cấp hạ tầng có thể duy trì log kỹ thuật riêng theo dịch vụ của họ.",
    ],
  },
  {
    title: "Nhà cung cấp dịch vụ",
    paragraphs: [
      "Student Perks Hub hiện sử dụng Vercel để build/host ứng dụng và Supabase để cung cấp PostgreSQL, Auth và các dịch vụ backend liên quan. Dữ liệu cần thiết để cung cấp dịch vụ có thể được xử lý bởi các nhà cung cấp này theo cấu hình Production và điều khoản/chính sách của họ.",
      "Ứng dụng liên kết đến website của các nhà cung cấp ưu đãi bên thứ ba. Khi bạn mở một liên kết bên ngoài, website đích chịu trách nhiệm cho hoạt động xử lý dữ liệu của họ.",
    ],
  },
  {
    title: "Lưu giữ, bảo mật và khôi phục",
    paragraphs: [
      "Dữ liệu ứng dụng được giữ trong thời gian cần thiết để cung cấp tính năng, kiểm duyệt submission, bảo vệ tính toàn vẹn hệ thống hoặc đáp ứng nghĩa vụ vận hành hợp lý. Chính sách lưu giữ chi tiết sẽ được điều chỉnh khi khối lượng dữ liệu người dùng tăng; không nên hiểu nội dung này là cam kết lưu dữ liệu vô thời hạn.",
      "Quyền truy cập database được bảo vệ bằng Row Level Security và các kiểm soát dành riêng cho admin. Backup/recovery được thiết kế để không đưa raw SQL chứa dữ liệu người dùng vào artifact công khai; phạm vi và giới hạn phục hồi được quản lý như một phần của quy trình vận hành Production.",
    ],
  },
  {
    title: "Yêu cầu về dữ liệu của bạn",
    paragraphs: [
      "Tùy nơi bạn sinh sống, bạn có thể có quyền yêu cầu truy cập, sửa hoặc xóa dữ liệu cá nhân. Hãy liên hệ chủ sở hữu repository qua một kênh riêng tư và cung cấp đủ thông tin để xác minh yêu cầu mà không đăng dữ liệu nhạy cảm vào issue công khai.",
      "Đối với báo cáo lỗ hổng bảo mật, hãy sử dụng kênh private vulnerability reporting / security advisory của repository khi khả dụng, theo SECURITY.md.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Pháp lý</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Quyền riêng tư</h1>
      <p className="mt-4 text-sm text-slate-500">Có hiệu lực: 4 tháng 10, 2026</p>
      <p className="mt-6 max-w-3xl text-base leading-7 text-slate-700">
        Chính sách này mô tả dữ liệu mà Student Perks Hub xử lý trong phiên bản
        Production hiện tại. Nếu tính năng, nhà cung cấp hoặc mục đích xử lý thay
        đổi đáng kể, nội dung này cần được cập nhật trước hoặc cùng lúc với thay đổi.
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700 sm:text-base">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 border-t pt-8">
        <h2 className="text-2xl font-bold tracking-tight">Thay đổi chính sách</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
          Chúng tôi có thể cập nhật chính sách này để phản ánh thay đổi của sản
          phẩm, hạ tầng hoặc yêu cầu áp dụng. Ngày có hiệu lực ở đầu trang sẽ được
          cập nhật khi có thay đổi quan trọng.
        </p>
      </section>
    </main>
  );
}
