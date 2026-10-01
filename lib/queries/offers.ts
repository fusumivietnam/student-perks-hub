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
