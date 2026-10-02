import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </section>
  );
}
