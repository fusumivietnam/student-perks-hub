const fallbackSiteUrl = "http://localhost:3000";

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return new URL(fallbackSiteUrl);

  try {
    return new URL(value);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute URL");
  }
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}
