import type { Metadata } from "next";
import Link from "next/link";

import { OfferCard } from "@/components/offers/offer-card";
import { getOfferDiscovery } from "@/lib/queries/offer-discovery";

export const metadata: Metadata = {
  title: "Tìm kiếm ưu đãi",
  description: "Tìm kiếm ưu đãi sinh viên theo tên chương trình hoặc nhà cung cấp.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string | string[];
  page?: string | string[];
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = one(params.q)?.trim() ?? "";
  const page = pageNumber(one(params.page));
  const result = q
    ? await getOfferDiscovery({ q, page, sort: "recent" })
    : { offers: [], count: 0, page: 1, pageSize: 12 };

  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));
  const currentPage = Math.min(result.page, totalPages);
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams({ q });
    if (nextPage > 1) query.set("page", String(nextPage));
    return `/search?${query.toString()}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Tìm kiếm</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        Tìm ưu đãi
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        Tìm theo tên chương trình hoặc nhà cung cấp. Dùng bộ lọc nâng cao tại trang Tất cả ưu đãi.
      </p>

      <form action="/search" className="mt-8 flex gap-2 rounded-2xl border bg-white p-2 shadow-sm">
        <input
          type="search"
          name="q"
          defaultValue={q}
          required
          maxLength={80}
          placeholder="GitHub, Notion, Figma, Azure..."
          className="min-w-0 flex-1 rounded-xl px-3 py-2 outline-none"
        />
        <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          Tìm
        </button>
      </form>

      {!q ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 p-10 text-center">
          <p className="font-semibold">Nhập từ khóa để bắt đầu tìm kiếm.</p>
          <Link href="/offers" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            Hoặc duyệt tất cả ưu đãi
          </Link>
        </div>
      ) : result.offers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 p-10 text-center">
          <p className="font-semibold">Không tìm thấy kết quả cho “{q}”.</p>
          <p className="mt-1 text-sm text-slate-500">Thử từ khóa ngắn hơn hoặc duyệt theo danh mục.</p>
          <Link href="/categories" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            Xem danh mục
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">{result.count} kết quả cho “{q}”</p>
            <Link href={`/offers?q=${encodeURIComponent(q)}`} className="text-sm font-semibold text-primary hover:underline">
              Mở bộ lọc nâng cao
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav aria-label="Phân trang tìm kiếm" className="mt-8 flex items-center justify-between gap-4">
              {currentPage > 1 ? (
                <Link href={pageHref(currentPage - 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold">
                  Trang trước
                </Link>
              ) : <span />}
              <span className="text-sm text-slate-500">Trang {currentPage} / {totalPages}</span>
              {currentPage < totalPages ? (
                <Link href={pageHref(currentPage + 1)} className="rounded-xl border px-4 py-2 text-sm font-semibold">
                  Trang sau
                </Link>
              ) : <span />}
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
