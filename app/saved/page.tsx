import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { updateBookmark } from "@/app/saved/actions";
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
      <p className="text-sm font-semibold text-primary">Cá nhân</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        Ưu đãi đã lưu
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-slate-600">
        Danh sách này được lưu trong tài khoản của bạn và được bảo vệ bởi RLS.
      </p>

      {offers.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 p-10 text-center">
          <p className="font-semibold">Bạn chưa lưu ưu đãi nào.</p>
          <p className="mt-1 text-sm text-slate-500">
            Mở một offer và chọn Lưu ưu đãi để thêm vào đây.
          </p>
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
                <button className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700">
                  Bỏ khỏi danh sách đã lưu
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
