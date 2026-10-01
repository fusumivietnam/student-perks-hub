import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Database } from "@/lib/database.types";

type Offer = Database["public"]["Tables"]["offers"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export type OfferCardOffer = Pick<
  Offer,
  | "id"
  | "slug"
  | "title"
  | "provider"
  | "summary"
  | "logo_url"
  | "benefit_type"
  | "benefit_text"
> & {
  category: Pick<Category, "name" | "slug"> | null;
};

type OfferCardProps = {
  offer: OfferCardOffer;
};

function benefitLabel(type: string) {
  switch (type) {
    case "free":
      return "Miễn phí";
    case "discount":
      return "Giảm giá";
    case "credit":
      return "Credit";
    case "trial":
      return "Dùng thử";
    default:
      return "Ưu đãi";
  }
}

export function OfferCard({ offer }: OfferCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-50 text-sm font-bold text-slate-700">
            {offer.logo_url ? (
              // Provider logos are external assets. Keep the card portable until
              // production image-host allowlists are defined.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={offer.logo_url}
                alt=""
                className="size-full object-contain p-1.5"
              />
            ) : (
              <span aria-hidden="true">
                {offer.provider.trim().charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-500">
              {offer.provider}
            </p>
            {offer.category ? (
              <p className="mt-0.5 truncate text-xs font-medium text-primary">
                {offer.category.name}
              </p>
            ) : null}
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary">
          {offer.benefit_text?.trim() || benefitLabel(offer.benefit_type)}
        </span>
      </div>

      <div className="mt-5 flex-1">
        <h3 className="text-lg font-bold tracking-tight text-slate-950">
          <Link
            href={`/offers/${offer.slug}`}
            className="rounded-sm outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {offer.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {offer.summary}
        </p>
      </div>

      <div className="mt-5 border-t pt-4">
        <Link
          href={`/offers/${offer.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Xem ưu đãi
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
