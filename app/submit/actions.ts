"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const submissionSchema = z.object({
  provider: z.string().trim().min(2).max(120),
  title: z.string().trim().min(4).max(180),
  officialUrl: z
    .string()
    .trim()
    .url()
    .max(1000)
    .refine(
      (value) => value.startsWith("https://") || value.startsWith("http://"),
      "URL phải dùng http hoặc https.",
    ),
  description: z.string().trim().max(3000).optional(),
  submitterNote: z.string().trim().max(1500).optional(),
});

export async function submitOffer(formData: FormData) {
  const parsed = submissionSchema.safeParse({
    provider: formData.get("provider"),
    title: formData.get("title"),
    officialUrl: formData.get("officialUrl"),
    description: formData.get("description") || undefined,
    submitterNote: formData.get("submitterNote") || undefined,
  });

  if (!parsed.success) {
    redirect("/submit?error=Vui+lòng+kiểm+tra+lại+thông+tin");
  }

  const [auth, supabase] = await Promise.all([
    getCurrentAuth(),
    createClient(),
  ]);

  const { error } = await supabase.from("submissions").insert({
    submitter_user_id: auth?.id ?? null,
    provider: parsed.data.provider,
    title: parsed.data.title,
    official_url: parsed.data.officialUrl,
    description: parsed.data.description || null,
    submitter_note: parsed.data.submitterNote || null,
  });

  if (error?.code === "23505") {
    redirect(
      "/submit?error=Link+này+đã+có+một+đề+xuất+đang+được+xử+lý+hoặc+đã+được+duyệt",
    );
  }

  if (error) {
    console.error("Failed to create offer submission", error);
    redirect("/submit?error=Không+thể+gửi+đề+xuất+lúc+này");
  }

  if (auth) {
    redirect("/account/submissions?submitted=1");
  }

  redirect("/submit?success=1");
}
