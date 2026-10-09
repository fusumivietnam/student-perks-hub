import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OfferCard } from "@/components/offers/offer-card";
import { getBrandBySlug } from "@/lib/queries/brands";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Thương hiệu không tồn tại" };

  return {
    title: `${brand.name} — ưu đãi sinh viên`,
    description: `Các ưu đãi sinh viên đã publish từ ${brand.name}.`,
    alternates: { canonical: `/brands/${brand.slug}` },
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-primary">Thương hiệu</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{brand.name}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            {brand.offers.length} ưu đãi đang được publish. Mỗi ưu đãi dẫn tới nguồn chính thức để bạn tự kiểm tra điều kiện trước khi đăng ký.
          </p>
        </div>
        <Link href={`/search?q=${encodeURIComponent(brand.name)}`} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">
          Tìm {brand.name}
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {brand.offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>

      <div className="mt-10 border-t pt-6">
        <Link href="/offers" className="text-sm font-semibold text-primary hover:underline">
          ← Xem tất cả ưu đãi
        </Link>
      </div>
    </section>
  );
}
