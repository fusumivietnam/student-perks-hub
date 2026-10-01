import { createClient } from "@/lib/supabase/server";

export async function getCategories() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, icon, sort_order")
    .order("sort_order")
    .order("name");

  if (error) {
    console.error("Failed to load categories", error);
    throw new Error("Could not load categories");
  }

  return data;
}
