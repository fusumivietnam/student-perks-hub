import { brandSlug } from "@/lib/brands";
import { createClient } from "@/lib/supabase/server";

const offerCardSelect = `
  id,
  slug,
  title,
  provider,
  summary,
  logo_url,
  benefit_type,
  benefit_text,
  category:categories (
    name,
    slug
  )
`;

export async function getPublishedBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("provider")
    .eq("status", "published")
    .order("provider");

  if (error) {
    console.error("Failed to load published brands", error);
    throw new Error("Could not load brands");
  }

  const unique = new Map<string, string>();
  for (const row of data ?? []) {
    const provider = row.provider.trim();
    const slug = brandSlug(provider);
    if (provider && slug && !unique.has(slug)) unique.set(slug, provider);
  }

  return [...unique.entries()].map(([slug, name]) => ({ slug, name }));
}

export async function getBrandBySlug(slug: string) {
  const brands = await getPublishedBrands();
  const brand = brands.find((item) => item.slug === slug);
  if (!brand) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(offerCardSelect)
    .eq("status", "published")
    .eq("provider", brand.name)
    .order("published_at", { ascending: false })
    .order("title");

  if (error) {
    console.error("Failed to load brand offers", error);
    throw new Error("Could not load brand offers");
  }

  return { ...brand, offers: data ?? [] };
}
