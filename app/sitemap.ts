import type { MetadataRoute } from "next";

import { brandSlug } from "@/lib/brands";
import { createClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("slug,provider,updated_at,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to build sitemap", error);
    throw new Error("Could not build sitemap");
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/offers"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/categories"),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/submit"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const offerEntries: MetadataRoute.Sitemap = (data ?? []).map((offer) => ({
    url: absoluteUrl("/offers/" + offer.slug),
    lastModified: offer.updated_at ?? offer.published_at ?? undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const providers = new Set<string>();
  for (const offer of data ?? []) {
    const slug = brandSlug(offer.provider);
    if (slug) providers.add(slug);
  }

  const brandEntries: MetadataRoute.Sitemap = [...providers].map((slug) => ({
    url: absoluteUrl(`/brands/${slug}`),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...brandEntries, ...offerEntries];
}
