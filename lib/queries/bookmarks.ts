import { createClient } from "@/lib/supabase/server";

const savedOfferSelect = `
  offer:offers (
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
  )
`;

export async function isOfferBookmarked(userId: string, offerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("offer_id")
    .eq("user_id", userId)
    .eq("offer_id", offerId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load bookmark state", error);
    throw new Error("Could not load bookmark state");
  }

  return Boolean(data);
}

export async function getSavedOffers(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select(savedOfferSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load saved offers", error);
    throw new Error("Could not load saved offers");
  }

  return data.flatMap((bookmark) => (bookmark.offer ? [bookmark.offer] : []));
}
