import type { MetadataRoute } from "next";

import { getPublishedOfferSitemapEntries } from "@/lib/queries/offers";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const staticPaths = [
    "/",
    "/offers",
    "/categories",
    "/about",
    "/privacy",
    "/terms",
    "/submit",
  ];

  const staticEntries = staticPaths.map((path) => ({
    url: new URL(path, baseUrl).toString(),
    changeFrequency:
      path === "/" || path === "/offers"
        ? ("daily" as const)
        : ("monthly" as const),
    priority: path === "/" ? 1 : path === "/offers" ? 0.9 : 0.6,
  }));

  const offers = await getPublishedOfferSitemapEntries();
  const offerEntries = offers.map((offer) => ({
    url: new URL(`/offers/${offer.slug}`, baseUrl).toString(),
    lastModified: offer.updated_at ? new Date(offer.updated_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...offerEntries];
}
