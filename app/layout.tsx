import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSiteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

const siteDescription =
  "Khám phá các ưu đãi, công cụ và tài nguyên dành cho sinh viên.";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Student Perks Hub",
    template: "%s | Student Perks Hub",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "Student Perks Hub",
    title: "Student Perks Hub",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Perks Hub",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
