import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function SubmitPage() {
  return (
    <PagePlaceholder
      eyebrow="Cộng đồng"
      title="Gửi một ưu đãi"
      description="Form submission sẽ dùng Server Action, Zod validation và bảng submissions đã được bảo vệ bằng RLS."
    />
  );
}
