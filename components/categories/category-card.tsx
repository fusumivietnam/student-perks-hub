import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Database } from "@/lib/database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

type CategoryCardProps = {
  category: Pick<Category, "slug" | "name" | "description">;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/offers?category=${encodeURIComponent(category.slug)}`}
      className="group block rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-950">{category.name}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {category.description ?? "Khám phá các ưu đãi trong danh mục này."}
          </p>
        </div>
        <ArrowRight
          className="mt-0.5 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
