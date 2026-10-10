"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

const submissionReviewSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string().trim().max(1000).optional(),
});

const submissionDraftSchema = z.object({
  submissionId: z.string().uuid(),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().uuid().optional(),
});

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  sortOrder: z.coerce.number().int().min(0).max(10000),
});

const offerSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(4).max(180),
  provider: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(500),
  officialUrl: z.string().trim().url().max(1000),
  categoryId: z.string().uuid().optional(),
  benefitType: z.enum(["free", "discount", "credit", "trial", "other"]),
  benefitText: z.string().trim().max(160).optional(),
  status: z.enum(["draft", "published", "expired", "archived"]),
  featured: z.boolean(),
});

const idSchema = z.string().uuid();

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    throw new Error("Admin authorization required");
  }
  return admin;
}

function optionalText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
}

export async function reviewSubmission(formData: FormData) {
  await requireAdmin();
  const parsed = submissionReviewSchema.safeParse({
    submissionId: formData.get("submissionId"),
    status: formData.get("status"),
    reviewNote: optionalText(formData.get("reviewNote")),
  });
  if (!parsed.success) throw new Error("Invalid submission review request");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("review_submission", {
    p_submission_id: parsed.data.submissionId,
    p_status: parsed.data.status,
    p_review_note: parsed.data.reviewNote,
  });

  if (error) throw new Error("Could not review submission");
  if (!data) throw new Error("Submission was already reviewed or cancelled");

  revalidatePath("/admin");
  revalidatePath("/account");
}

export async function createDraftFromSubmission(formData: FormData) {
  await requireAdmin();
  const parsed = submissionDraftSchema.safeParse({
    submissionId: formData.get("submissionId"),
    slug: formData.get("slug"),
    categoryId: optionalText(formData.get("categoryId")),
  });
  if (!parsed.success) throw new Error("Invalid draft conversion request");

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_draft_offer_from_submission", {
    p_submission_id: parsed.data.submissionId,
    p_slug: parsed.data.slug,
    p_category_id: parsed.data.categoryId,
  });

  if (error) throw new Error("Could not create draft offer from submission");

  revalidatePath("/admin");
  revalidatePath("/offers");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    id: optionalText(formData.get("id")),
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: optionalText(formData.get("description")),
    sortOrder: formData.get("sortOrder") || "0",
  });
  if (!parsed.success) throw new Error("Invalid category");

  const supabase = await createClient();
  const payload = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    sort_order: parsed.data.sortOrder,
  };

  const query = parsed.data.id
    ? supabase.from("categories").update(payload).eq("id", parsed.data.id)
    : supabase.from("categories").insert(payload);

  const { error } = await query;
  if (error) throw new Error("Could not save category");

  revalidatePath("/admin");
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error("Could not delete category");

  revalidatePath("/admin");
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function saveOffer(formData: FormData) {
  await requireAdmin();

  const parsed = offerSchema.safeParse({
    id: optionalText(formData.get("id")),
    slug: formData.get("slug"),
    title: formData.get("title"),
    provider: formData.get("provider"),
    summary: formData.get("summary"),
    officialUrl: formData.get("officialUrl"),
    categoryId: optionalText(formData.get("categoryId")),
    benefitType: formData.get("benefitType"),
    benefitText: optionalText(formData.get("benefitText")),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) throw new Error("Invalid offer");

  const supabase = await createClient();
  const payload = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    provider: parsed.data.provider,
    summary: parsed.data.summary,
    official_url: parsed.data.officialUrl,
    category_id: parsed.data.categoryId ?? null,
    benefit_type: parsed.data.benefitType,
    benefit_text: parsed.data.benefitText ?? null,
    status: parsed.data.status,
    is_featured: parsed.data.featured,
    published_at:
      parsed.data.status === "published" ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  const query = parsed.data.id
    ? supabase.from("offers").update(payload).eq("id", parsed.data.id)
    : supabase.from("offers").insert(payload);

  const { error } = await query;
  if (error) throw new Error("Could not save offer");

  revalidatePath("/admin");
  revalidatePath("/offers");
  revalidatePath("/");
  revalidatePath("/offers/" + parsed.data.slug);
}

export async function deleteOffer(formData: FormData) {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));

  const supabase = await createClient();
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) throw new Error("Could not delete offer");

  revalidatePath("/admin");
  revalidatePath("/offers");
  revalidatePath("/");
}
