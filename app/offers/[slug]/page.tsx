import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BadgeCheck, CalendarDays } from "lucide-react";

import { updateBookmark } from "@/app/saved/actions";
import { OfferCard } from "@/components/offers/offer-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentAuth } from "@/lib/auth";
import { isOfferBookmarked } from "@/lib/queries/bookmarks";
import { getOfferBySlug, getRelatedOffers } from "@/lib/queries/offers";

export const dynamic = "force-dynamic";

type OfferPageProps = {
  params: Promise<{ slug: string }>;
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

function formatVerifiedDate(value: string | null) {
  if (!value) return null;

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export async function generateMetadata({
  params,
}: OfferPageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug);

  if (!offer) {
    return {
      title: "Không tìm thấy ưu đãi",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/offers/${offer.slug}`;
  const title = `${offer.title} — ${offer.provider}`;

  return {
    title,
    description: offer.summary,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description: offer.summary,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: offer.summary,
    },
  };
}

export default async function OfferDetailPage({ params }: OfferPageProps) {
  const { slug } = await params;
  const offer = await getOfferBySlug(slug);

  if (!offer) {
    notFound();
  }

  const [relatedOffers, auth] = await Promise.all([
    getRelatedOffers(offer.id, offer.category_id),
    getCurrentAuth(),
  ]);
  const bookmarked = auth ? await isOfferBookmarked(auth.id, offer.id) : false;
  const verifiedDate = formatVerifiedDate(offer.last_verified_at);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <Link
        href="/offers"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Tất cả ưu đãi
      </Link>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0 overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            {offer.category ? (
              <Link
                href={`/offers?category=${encodeURIComponent(offer.category.slug)}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {offer.category.name}
              </Link>
            ) : null}

            <Badge>
              {offer.benefit_text?.trim() || benefitLabel(offer.benefit_type)}
            </Badge>
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            {offer.provider}
          </p>
          <h1 className="mt-2 max-w-4xl text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
            {offer.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            {offer.summary}
          </p>

          </div>
          <div className="px-6 pb-9 pt-1 sm:px-9">
          {offer.description ? (
            <section className="mt-10">
              <h2 className="text-2xl font-bold tracking-tight">Chi tiết</h2>
              <p className="mt-3 max-w-3xl whitespace-pre-line leading-7 text-slate-700">
                {offer.description}
              </p>
            </section>
          ) : null}

          {offer.eligibility ? (
            <section className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <BadgeCheck className="size-5 text-primary" aria-hidden="true" />
                Điều kiện
              </h2>
              <p className="mt-3 leading-7 text-slate-700">{offer.eligibility}</p>
            </section>
          ) : null}

          {offer.how_to_claim ? (
            <section className="mt-10">
              <h2 className="text-2xl font-bold tracking-tight">
                Cách nhận ưu đãi
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-700">
                {offer.how_to_claim}
              </p>
            </section>
          ) : null}

          {offer.tags.length > 0 ? (
            <div className="mt-10 flex flex-wrap gap-2">
              {offer.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-3 py-1 text-xs font-medium text-slate-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          </div>
        </article>

        <aside className="lg:pt-2">
          <Card className="sticky top-24 gap-0 border-blue-100 p-6 shadow-[0_18px_48px_-32px_rgba(30,64,175,0.4)]">
            <p className="ui-eyebrow">Quyền lợi dành cho bạn</p>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              {offer.benefit_text?.trim() || benefitLabel(offer.benefit_type)}
            </p>

            <a
              href={offer.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Mở trang chính thức
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>

            {auth ? (
              <form action={updateBookmark} className="mt-2">
                <input type="hidden" name="offerId" value={offer.id} />
                <input type="hidden" name="slug" value={offer.slug} />
                <input
                  type="hidden"
                  name="intent"
                  value={bookmarked ? "remove" : "save"}
                />
                <Button variant="outline" className="w-full">
                  {bookmarked ? "Bỏ lưu" : "Lưu ưu đãi"}
                </Button>
              </form>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(`/offers/${offer.slug}`)}`}
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-xl border px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Đăng nhập để lưu
              </Link>
            )}

            {verifiedDate ? (
              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Xác minh gần nhất: {verifiedDate}
              </p>
            ) : null}

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Điều kiện có thể thay đổi. Luôn kiểm tra lại trên trang chính thức
              trước khi đăng ký.
            </p>
          </Card>
        </aside>
      </div>

      {relatedOffers.length > 0 ? (
        <section className="mt-16 border-t pt-10">
          <p className="text-sm font-semibold text-primary">Cùng danh mục</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Ưu đãi liên quan
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedOffers.map((related) => (
              <OfferCard key={related.id} offer={related} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
