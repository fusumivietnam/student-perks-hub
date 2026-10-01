import { PagePlaceholder } from "@/components/layout/page-placeholder";

export default function SavedPage() {
  return (
    <PagePlaceholder
      eyebrow="Cá nhân"
      title="Ưu đãi đã lưu"
      description="Bookmark sẽ được bổ sung sau authentication và RLS, không dùng localStorage làm nguồn dữ liệu chính."
    />
  );
}
