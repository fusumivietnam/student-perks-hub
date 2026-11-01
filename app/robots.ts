import type { MetadataRoute } from "next";

import { absoluteUrl, getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/verification",
        "/login",
        "/forgot-password",
        "/reset-password",
        "/saved",
        "/search",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: getSiteUrl().origin,
  };
}
