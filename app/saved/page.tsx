import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { updateBookmark } from "@/app/saved/actions";
import { Button } from "@/components/ui/button";
import { OfferCard } from "@/components/offers/offer-card";
import { getCurrentAuth } from "@/lib/auth";
import { getSavedOffers } from "@/lib/queries/bookmarks";

export const metadata: Metadata = {
  title: "Ưu đãi đã lưu",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const auth = await getCurrentAuth();

  if (!auth) {
    redirect("/login?next=/saved");
  }

  const offers = await getSavedOffers(auth.id);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Cá nhân</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Ưu đãi đã lưu
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            Danh sách này thuộc tài khoản của bạn, đồng bộ giữa các phiên đăng nhập và được bảo vệ bởi RLS.
          </p>
        </div>
        <Link
          href="/account"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
        >
          Về trung tâm tài khoản
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 p-10 text-center">
          <p className="font-semibold">Bạn chưa lưu ưu đãi nào.</p>
          <p className="mt-1 text-sm text-slate-500">
            Mở một ưu đãi và chọn Lưu ưu đãi để thêm vào danh sách cá nhân.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/offers"
              className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              Khám phá ưu đãi
            </Link>
            <Link
              href="/account"
              className="inline-flex min-h-11 items-center rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Trung tâm tài khoản
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <div key={offer.id} className="grid gap-2">
              <OfferCard offer={offer} />
              <form action={updateBookmark}>
                <input type="hidden" name="offerId" value={offer.id} />
                <input type="hidden" name="slug" value={offer.slug} />
                <input type="hidden" name="intent" value="remove" />
                <Button variant="outline" className="w-full hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                  Bỏ khỏi danh sách đã lưu
                </Button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
