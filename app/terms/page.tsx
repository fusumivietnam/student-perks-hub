import type { Metadata } from "next";

const description =
  "Điều khoản sử dụng Student Perks Hub và các liên kết ưu đãi bên thứ ba.";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description,
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Điều khoản sử dụng | Student Perks Hub",
    description,
    url: "/terms",
    siteName: "Student Perks Hub",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Điều khoản sử dụng | Student Perks Hub",
    description,
  },
};

const sections = [
  {
    title: "Vai trò của Student Perks Hub",
    paragraphs: [
      "Student Perks Hub là một directory giúp người dùng tìm các ưu đãi và tài nguyên được công bố bởi bên thứ ba. Trừ khi được nêu rõ, dự án không phải là đơn vị phát hành ưu đãi, không đại diện cho nhà cung cấp và không bảo đảm rằng một chương trình sẽ luôn còn hiệu lực.",
      "Thông tin được tổng hợp với mục tiêu dẫn người dùng về nguồn chính thức. Điều kiện, mức giảm, thời hạn, phạm vi quốc gia và quy trình xác minh có thể thay đổi mà không báo trước trên Student Perks Hub.",
    ],
  },
  {
    title: "Điều kiện và quyết định của nhà cung cấp",
    paragraphs: [
      "Quyền nhận ưu đãi do nhà cung cấp bên thứ ba quyết định. Bạn có trách nhiệm đọc điều khoản hiện hành trên trang chính thức trước khi đăng ký, thanh toán hoặc cung cấp thông tin cho họ.",
      "Việc một ưu đãi xuất hiện trên Student Perks Hub không tạo ra cam kết rằng bạn sẽ được chấp thuận, nhận đúng mức quyền lợi được mô tả trước đó hoặc có quyền khiếu nại với Student Perks Hub về quyết định của nhà cung cấp.",
    ],
  },
  {
    title: "Tài khoản và tính năng cá nhân",
    paragraphs: [
      "Một số tính năng như lưu bookmark hoặc xem submission của chính bạn yêu cầu đăng nhập. Bạn không được cố truy cập tài khoản, dữ liệu hoặc khu vực admin mà bạn không được phép sử dụng, cũng không được tìm cách vô hiệu hóa các kiểm soát xác thực, Row Level Security hoặc giới hạn bảo mật khác.",
      "Bạn chịu trách nhiệm bảo vệ phiên đăng nhập và thiết bị của mình. Nếu nghi ngờ tài khoản hoặc hệ thống bị xâm nhập, hãy ngừng sử dụng phiên bị ảnh hưởng và báo cáo qua kênh riêng tư phù hợp.",
    ],
  },
  {
    title: "Gửi ưu đãi",
    paragraphs: [
      "Bạn có thể gửi đề xuất về một ưu đãi. Hãy chỉ cung cấp thông tin mà bạn có quyền chia sẻ và ưu tiên URL chính thức của nhà cung cấp. Không gửi secret, credential, dữ liệu cá nhân không cần thiết, nội dung bất hợp pháp, nội dung xâm phạm quyền của người khác hoặc dữ liệu được lấy bằng cách trái phép.",
      "Submission có thể được kiểm duyệt, chỉnh sửa cho phù hợp với định dạng, từ chối, lưu trữ hoặc không công bố. Việc gửi nội dung không bảo đảm nội dung sẽ xuất hiện trên website.",
    ],
  },
  {
    title: "Liên kết và dịch vụ bên thứ ba",
    paragraphs: [
      "Website chứa liên kết đến GitHub, Microsoft, Figma, JetBrains và các nhà cung cấp khác tùy danh mục ưu đãi hiện hành. Các website đó có điều khoản, chính sách quyền riêng tư, giá và cơ chế xác minh riêng; Student Perks Hub không kiểm soát các dịch vụ bên ngoài sau khi bạn rời website.",
    ],
  },
  {
    title: "Sử dụng hợp lý và bảo mật",
    paragraphs: [
      "Không sử dụng dịch vụ để phát tán mã độc, spam submission, tự động hóa gây gián đoạn, dò credential, vượt quyền, khai thác lỗ hổng nhằm gây hại hoặc thu thập dữ liệu người dùng trái phép.",
      "Nghiên cứu bảo mật thiện chí nên được báo cáo riêng tư theo SECURITY.md. Không đăng exploit, credential hoặc dữ liệu người dùng thật vào issue công khai.",
    ],
  },
  {
    title: "Tính sẵn sàng và giới hạn thông tin",
    paragraphs: [
      "Dịch vụ được cung cấp trên cơ sở nỗ lực hợp lý. Nội dung ưu đãi có thể lỗi thời giữa hai lần xác minh, và dịch vụ có thể tạm ngừng để bảo trì, xử lý sự cố hoặc vì phụ thuộc hạ tầng bên thứ ba.",
      "Trong phạm vi pháp luật cho phép, Student Perks Hub không chịu trách nhiệm thay cho nhà cung cấp về việc từ chối eligibility, thay đổi ưu đãi, giao dịch trên website bên thứ ba hoặc thiệt hại phát sinh chỉ vì người dùng dựa vào thông tin đã thay đổi mà không kiểm tra nguồn chính thức.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Pháp lý</p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">Điều khoản sử dụng</h1>
      <p className="mt-4 text-sm text-slate-500">Có hiệu lực: 4 tháng 10, 2026</p>
      <p className="mt-6 max-w-3xl text-base leading-7 text-slate-700">
        Khi sử dụng Student Perks Hub, bạn đồng ý sử dụng dịch vụ phù hợp với các
        điều khoản dưới đây và pháp luật áp dụng. Nếu không đồng ý, bạn không nên
        tiếp tục sử dụng các tính năng yêu cầu tài khoản hoặc gửi dữ liệu.
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
        <h2 className="text-2xl font-bold tracking-tight">Thay đổi và liên hệ</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
          Điều khoản có thể được cập nhật khi chức năng hoặc mô hình vận hành thay
          đổi. Các câu hỏi pháp lý, quyền riêng tư hoặc yêu cầu chứa thông tin cá
          nhân nên được gửi cho chủ sở hữu repository qua kênh riêng tư; không đăng
          dữ liệu nhạy cảm vào issue công khai.
        </p>
      </section>
    </main>
  );
}
