"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const bookmarkSchema = z.object({
  offerId: z.string().uuid(),
  slug: z.string().min(1).max(160),
  intent: z.enum(["save", "remove"]),
});

export async function updateBookmark(formData: FormData) {
  const parsed = bookmarkSchema.safeParse({
    offerId: formData.get("offerId"),
    slug: formData.get("slug"),
    intent: formData.get("intent"),
  });

  if (!parsed.success) {
    throw new Error("Invalid bookmark request");
  }

  const auth = await getCurrentAuth();
  if (!auth) {
    redirect(`/login?next=${encodeURIComponent(`/offers/${parsed.data.slug}`)}`);
  }

  const supabase = await createClient();

  if (parsed.data.intent === "remove") {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", auth.id)
      .eq("offer_id", parsed.data.offerId);

    if (error) {
      console.error("Failed to remove bookmark", error);
      throw new Error("Could not remove bookmark");
    }
  } else {
    const { error } = await supabase.from("bookmarks").insert({
      user_id: auth.id,
      offer_id: parsed.data.offerId,
    });

    if (error && error.code !== "23505") {
      console.error("Failed to save bookmark", error);
      throw new Error("Could not save bookmark");
    }
  }

  revalidatePath("/saved");
  revalidatePath(`/offers/${parsed.data.slug}`);
}
