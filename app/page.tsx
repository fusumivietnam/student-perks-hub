import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import { CategoryCard } from "@/components/categories/category-card";
import { OfferCard, type OfferCardOffer } from "@/components/offers/offer-card";
import { getCategories } from "@/lib/queries/categories";
import {
  getFeaturedOffers,
  getPopularOffers,
  getRecentOffers,
} from "@/lib/queries/offers";

export const dynamic = "force-dynamic";

type OfferSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  offers: OfferCardOffer[];
};

function OfferSection({
  eyebrow,
  title,
  description,
  offers,
}: OfferSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        <Link
          href="/offers"
          className="hidden items-center gap-1 text-sm font-semibold text-primary sm:flex"
        >
          Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
          <p className="font-semibold">Chưa có ưu đãi phù hợp.</p>
          <p className="mt-1 text-sm text-slate-500">
            Nội dung sẽ xuất hiện sau khi có offer đã được xác minh và publish.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function HomePage() {
  const [categories, featuredOffers, popularOffers, recentOffers] =
    await Promise.all([
      getCategories(),
      getFeaturedOffers(),
      getPopularOffers(),
      getRecentOffers(),
    ]);

  return (
    <>
      <section className="overflow-hidden border-b bg-gradient-to-br from-blue-50 via-white to-violet-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_.85fr] lg:px-8 lg:py-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm font-medium text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              Ưu đãi dành riêng cho sinh viên
            </div>
            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Học nhiều hơn.{" "}
              <span className="text-primary">Tiết kiệm nhiều hơn.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Khám phá phần mềm, AI, cloud, thiết kế và tài nguyên học tập có
              chương trình ưu đãi dành cho sinh viên.
            </p>

            <form
              action="/offers"
              className="mt-8 flex max-w-2xl gap-2 rounded-2xl border bg-white p-2 shadow-sm"
            >
              <label htmlFor="home-search" className="sr-only">
                Tìm ưu đãi
              </label>
              <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                <Search
                  className="size-5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="home-search"
                  name="q"
                  placeholder="Tìm GitHub, Notion, Figma, Azure..."
                  className="w-full bg-transparent py-2 outline-none placeholder:text-slate-400"
                />
              </div>
              <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                Tìm kiếm
              </button>
            </form>
          </div>

          <div className="relative hidden min-h-80 lg:block">
            <div className="absolute inset-0 rounded-[2rem] border bg-white/70 shadow-sm" />
            <div className="absolute inset-6 flex flex-col justify-between rounded-[1.5rem] bg-gradient-to-br from-primary to-violet-500 p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Student-first
              </p>
              <div>
                <p className="text-3xl font-black">Tìm đúng ưu đãi.</p>
                <p className="mt-2 text-white/80">
                  Kiểm tra nguồn chính thức trước khi sử dụng.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/10 p-3">
                  <strong className="block text-xl">Chính thức</strong>
                  <span className="text-xs">nguồn ưu tiên</span>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <strong className="block text-xl">{categories.length}</strong>
                  <span className="text-xs">danh mục</span>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <strong className="block text-xl">Thủ công</strong>
                  <span className="text-xs">xác minh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Khám phá</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">
              Danh mục ưu đãi
            </h2>
          </div>
          <Link
            href="/categories"
            className="flex items-center gap-1 text-sm font-semibold text-primary"
          >
            Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
            <p className="font-semibold">Chưa có danh mục nào.</p>
            <p className="mt-1 text-sm text-slate-500">
              Danh mục sẽ xuất hiện sau khi dữ liệu được thêm vào hệ thống.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      <OfferSection
        eyebrow="Nổi bật"
        title="Ưu đãi đáng chú ý"
        description="Các chương trình được chọn để giúp sinh viên bắt đầu nhanh với công cụ học tập và phát triển."
        offers={featuredOffers}
      />

      <OfferSection
        eyebrow="Phổ biến"
        title="Được quan tâm nhiều"
        description="Sắp xếp theo lượt xem, với thứ tự phụ ổn định để kết quả không thay đổi ngẫu nhiên."
        offers={popularOffers}
      />

      <OfferSection
        eyebrow="Mới cập nhật"
        title="Ưu đãi gần đây"
        description="Các offer đã publish gần đây và có nguồn chính thức để kiểm tra điều kiện hiện hành."
        offers={recentOffers}
      />
    </>
  );
}
