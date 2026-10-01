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

export async function getFeaturedOffers(limit = 3) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offers")
    .select(offerCardSelect)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .order("title")
    .limit(limit);

  if (error) {
    console.error("Failed to load featured offers", error);
    throw new Error("Could not load featured offers");
  }

  return data;
}

export async function getPopularOffers(limit = 3) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offers")
    .select(offerCardSelect)
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .order("published_at", { ascending: false })
    .order("title")
    .limit(limit);

  if (error) {
    console.error("Failed to load popular offers", error);
    throw new Error("Could not load popular offers");
  }

  return data;
}

export async function getRecentOffers(limit = 3) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offers")
    .select(offerCardSelect)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("title")
    .limit(limit);

  if (error) {
    console.error("Failed to load recent offers", error);
    throw new Error("Could not load recent offers");
  }

  return data;
}


export async function getOfferBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offers")
    .select(`
      id,
      slug,
      title,
      provider,
      summary,
      description,
      official_url,
      logo_url,
      category_id,
      benefit_type,
      benefit_text,
      eligibility,
      how_to_claim,
      audience,
      tags,
      last_verified_at,
      published_at,
      category:categories (
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to load offer", error);
    throw new Error("Could not load offer");
  }

  return data;
}

export async function getRelatedOffers(
  offerId: string,
  categoryId: string | null,
  limit = 3,
) {
  if (!categoryId) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offers")
    .select(offerCardSelect)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", offerId)
    .order("published_at", { ascending: false })
    .order("title")
    .limit(limit);

  if (error) {
    console.error("Failed to load related offers", error);
    throw new Error("Could not load related offers");
  }

  return data;
}


export async function getPublishedOfferSitemapEntries() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("offers")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("slug")
    .limit(1000);

  if (error) {
    console.error("Failed to load offer sitemap entries", error);
    throw new Error("Could not load offer sitemap entries");
  }

  return data;
}
