import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentAdmin() {
  const auth = await getCurrentAuth();
  if (!auth) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_memberships")
    .select("role")
    .eq("user_id", auth.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to resolve admin membership", error);
    throw new Error("Could not verify admin authorization");
  }

  if (data?.role !== "admin") {
    return null;
  }

  return {
    ...auth,
    role: data.role,
  };
}
