const fallbackSiteUrl = "http://localhost:3000";

export const siteName = "Student Perks Hub";
export const siteDescription =
  "Khám phá các ưu đãi, công cụ và tài nguyên dành cho sinh viên từ nguồn chính thức.";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const value = configured || fallbackSiteUrl;

  try {
    return new URL(value);
  } catch {
    return new URL(fallbackSiteUrl);
  }
}
