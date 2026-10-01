import type { Metadata } from "next";
import Link from "next/link";

import { OfferCard } from "@/components/offers/offer-card";
import { getCategories } from "@/lib/queries/categories";
import { getOfferDiscovery } from "@/lib/queries/offer-discovery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tất cả ưu đãi",
  description: "Tìm và lọc các ưu đãi sinh viên đã được publish từ nguồn chính thức.",
  alternates: { canonical: "/offers" },
  openGraph: { url: "/offers", title: "Tất cả ưu đãi" },
};


type SearchParams = {
  q?: string | string[];
  category?: string | string[];
  benefit?: string | string[];
  audience?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function hrefWith(
  params: URLSearchParams,
  updates: Record<string, string | null>,
) {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(updates)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  const query = next.toString();
  return query ? `/offers?${query}` : "/offers";
}

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const q = one(raw.q)?.trim() ?? "";
  const category = one(raw.category) ?? "";
  const benefit = one(raw.benefit) ?? "";
  const audience = one(raw.audience) ?? "";
  const sort = one(raw.sort) ?? "recent";
  const page = pageNumber(one(raw.page));

  const [categories, result] = await Promise.all([
    getCategories(),
    getOfferDiscovery({ q, category, benefit, audience, sort, page }),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.count / result.pageSize));
  const currentPage = Math.min(result.page, totalPages);

  const current = new URLSearchParams();
  if (q) current.set("q", q);
  if (category) current.set("category", category);
  if (benefit) current.set("benefit", benefit);
  if (audience) current.set("audience", audience);
  if (sort && sort !== "recent") current.set("sort", sort);

  const filterFields = (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium">
        Danh mục
        <select
          name="category"
          defaultValue={category}
          className="rounded-xl border bg-white px-3 py-2.5"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Loại quyền lợi
        <select
          name="benefit"
          defaultValue={benefit}
          className="rounded-xl border bg-white px-3 py-2.5"
        >
          <option value="">Tất cả</option>
          <option value="free">Miễn phí</option>
          <option value="discount">Giảm giá</option>
          <option value="credit">Credit</option>
          <option value="trial">Dùng thử</option>
          <option value="other">Khác</option>
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Đối tượng
        <select
          name="audience"
          defaultValue={audience}
          className="rounded-xl border bg-white px-3 py-2.5"
        >
          <option value="">Tất cả</option>
          <option value="student">Sinh viên</option>
          <option value="teacher">Giáo viên</option>
        </select>
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Sắp xếp
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-xl border bg-white px-3 py-2.5"
        >
          <option value="recent">Mới cập nhật</option>
          <option value="popular">Phổ biến</option>
          <option value="title">Tên A–Z</option>
        </select>
      </label>

      <div className="flex gap-2">
        <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
          Áp dụng
        </button>
        <Link
          href="/offers"
          className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          Xóa lọc
        </Link>
      </div>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Khám phá</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        Tất cả ưu đãi
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        Tìm và lọc các chương trình ưu đãi đã publish theo nhu cầu của bạn.
      </p>

      <form
        action="/offers"
        className="mt-8 flex gap-2 rounded-2xl border bg-white p-2 shadow-sm"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Tìm GitHub, Notion, Figma, Azure..."
          className="min-w-0 flex-1 rounded-xl px-3 py-2 outline-none"
        />
        {category ? <input type="hidden" name="category" value={category} /> : null}
        {benefit ? <input type="hidden" name="benefit" value={benefit} /> : null}
        {audience ? <input type="hidden" name="audience" value={audience} /> : null}
        {sort !== "recent" ? <input type="hidden" name="sort" value={sort} /> : null}
        <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
          Tìm
        </button>
      </form>

      <div className="mt-8 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
        <aside className="hidden lg:block">
          <form action="/offers" className="sticky top-24 rounded-2xl border bg-slate-50 p-4">
            {q ? <input type="hidden" name="q" value={q} /> : null}
            {filterFields}
          </form>
        </aside>

        <div>
          <details className="mb-6 rounded-2xl border bg-slate-50 p-4 lg:hidden">
            <summary className="cursor-pointer font-semibold">Bộ lọc</summary>
            <form action="/offers" className="mt-4">
              {q ? <input type="hidden" name="q" value={q} /> : null}
              {filterFields}
            </form>
          </details>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {result.count} ưu đãi
            </p>
            {(q || category || benefit || audience) && (
              <p className="text-sm text-slate-500">
                Bộ lọc đang hoạt động
              </p>
            )}
          </div>

          {result.offers.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed bg-slate-50 p-10 text-center">
              <p className="font-semibold">Không tìm thấy ưu đãi phù hợp.</p>
              <p className="mt-1 text-sm text-slate-500">
                Thử đổi từ khóa hoặc xóa bớt bộ lọc.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {result.offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label="Phân trang ưu đãi"
              className="mt-8 flex items-center justify-between gap-4"
            >
              {currentPage > 1 ? (
                <Link
                  href={hrefWith(current, { page: String(currentPage - 1) })}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold"
                >
                  Trang trước
                </Link>
              ) : (
                <span />
              )}

              <span className="text-sm text-slate-500">
                Trang {currentPage} / {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={hrefWith(current, { page: String(currentPage + 1) })}
                  className="rounded-xl border px-4 py-2 text-sm font-semibold"
                >
                  Trang sau
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </section>
  );
}
