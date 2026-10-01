import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Về dự án",
  description:
    "Student Perks Hub tổng hợp ưu đãi và tài nguyên dành cho sinh viên từ nguồn chính thức.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "Về Student Perks Hub" },
};

export default function AboutPage() {
  return (
    <PagePlaceholder
      eyebrow="Student Perks Hub"
      title="Về dự án"
      description="Một directory tập trung vào các ưu đãi và tài nguyên có nguồn xác minh dành cho sinh viên."
    />
  );
}
