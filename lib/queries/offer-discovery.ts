import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 12;

export type OfferDiscoveryParams = {
  q?: string;
  category?: string;
  benefit?: string;
  audience?: string;
  sort?: string;
  page?: number;
};

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

function safeSearchTerm(value: string) {
  return value.replace(/[,%_()*]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function getOfferDiscovery(params: OfferDiscoveryParams) {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let categoryId: string | null = null;
  if (params.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .maybeSingle();

    categoryId = category?.id ?? null;
    if (!categoryId) {
      return { offers: [], count: 0, page, pageSize: PAGE_SIZE };
    }
  }

  let query = supabase
    .from("offers")
    .select(offerCardSelect, { count: "exact" })
    .eq("status", "published");

  const search = params.q ? safeSearchTerm(params.q) : "";
  if (search) {
    query = query.or(`title.ilike.%${search}%,provider.ilike.%${search}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (params.benefit) {
    query = query.eq("benefit_type", params.benefit);
  }

  if (params.audience) {
    query = query.contains("audience", [params.audience]);
  }

  switch (params.sort) {
    case "popular":
      query = query
        .order("view_count", { ascending: false })
        .order("published_at", { ascending: false });
      break;
    case "title":
      query = query.order("title");
      break;
    default:
      query = query
        .order("published_at", { ascending: false })
        .order("title");
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Failed to discover offers", error);
    throw new Error("Could not load offers");
  }

  return {
    offers: data,
    count: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}
