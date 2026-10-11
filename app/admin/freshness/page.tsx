import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, ShieldCheck } from "lucide-react";

import { verifyOfferFreshness } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Offer freshness",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type FreshnessState = "expired" | "unverified" | "stale" | "due-soon" | "fresh";

type OfferFreshness = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  official_url: string;
  status: string;
  last_verified_at: string | null;
  verification_interval_days: number;
  verification_note: string | null;
  expires_at: string | null;
  updated_at: string;
};

function freshnessState(offer: OfferFreshness, now: number): FreshnessState {
  if (offer.expires_at && new Date(offer.expires_at).getTime() <= now) return "expired";
  if (!offer.last_verified_at) return "unverified";

  const dueAt =
    new Date(offer.last_verified_at).getTime() +
    offer.verification_interval_days * 24 * 60 * 60 * 1000;

  if (dueAt <= now) return "stale";
  if (dueAt <= now + 14 * 24 * 60 * 60 * 1000) return "due-soon";
  return "fresh";
}

const stateConfig: Record<FreshnessState, { label: string; className: string; rank: number }> = {
  expired: {
    label: "Đã hết hạn",
    className: "border-red-200 bg-red-50 text-red-700",
    rank: 0,
  },
  unverified: {
    label: "Chưa xác minh",
    className: "border-orange-200 bg-orange-50 text-orange-700",
    rank: 1,
  },
  stale: {
    label: "Cần xác minh lại",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    rank: 2,
  },
  "due-soon": {
    label: "Sắp đến hạn",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    rank: 3,
  },
  fresh: {
    label: "Còn mới",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rank: 4,
  },
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function dueDate(offer: OfferFreshness) {
  if (!offer.last_verified_at) return null;
  return new Date(
    new Date(offer.last_verified_at).getTime() +
      offer.verification_interval_days * 24 * 60 * 60 * 1000,
  ).toISOString();
}

export default async function AdminFreshnessPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select(
      "id,slug,title,provider,official_url,status,last_verified_at,verification_interval_days,verification_note,expires_at,updated_at",
    )
    .in("status", ["draft", "published"])
    .order("updated_at", { ascending: false })
    .limit(250);

  if (error) throw new Error("Could not load offer freshness queue");

  const now = Date.now();
  const offers = (data ?? []) as OfferFreshness[];
  const queued = offers
    .map((offer) => ({ offer, state: freshnessState(offer, now) }))
    .sort((a, b) => {
      const rankDiff = stateConfig[a.state].rank - stateConfig[b.state].rank;
      if (rankDiff !== 0) return rankDiff;
      return a.offer.title.localeCompare(b.offer.title, "vi");
    });

  const counts = queued.reduce(
    (acc, item) => {
      acc[item.state] += 1;
      return acc;
    },
    { expired: 0, unverified: 0, stale: 0, "due-soon": 0, fresh: 0 } as Record<FreshnessState, number>,
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-primary">Data quality</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Offer freshness queue</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Ưu tiên các ưu đãi chưa xác minh, đã quá chu kỳ kiểm tra hoặc sắp đến hạn.
            Mỗi lần xác minh ghi lại người thực hiện, thời điểm, ghi chú và hạn hiệu lực.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-semibold text-primary hover:underline">
          Quản lý nội dung
        </Link>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Freshness summary">
        <Summary label="Hết hạn" value={counts.expired} icon={<AlertTriangle className="size-5" />} />
        <Summary label="Chưa xác minh" value={counts.unverified} icon={<ShieldCheck className="size-5" />} />
        <Summary label="Quá hạn kiểm tra" value={counts.stale} icon={<AlertTriangle className="size-5" />} />
        <Summary label="Sắp đến hạn" value={counts["due-soon"]} icon={<Clock3 className="size-5" />} />
        <Summary label="Còn mới" value={counts.fresh} icon={<CheckCircle2 className="size-5" />} />
      </section>

      <div className="mt-8 grid gap-5">
        {queued.length ? (
          queued.map(({ offer, state }) => {
            const stateMeta = stateConfig[state];
            const due = dueDate(offer);
            return (
              <article key={offer.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stateMeta.className}`}>
                        {stateMeta.label}
                      </span>
                      <span className="rounded-full border px-3 py-1 text-xs font-semibold text-slate-600">
                        {offer.status}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-slate-500">{offer.provider}</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-950">{offer.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      <a
                        href={offer.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
                      >
                        Nguồn chính thức
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                      <Link href={`/offers/${offer.slug}`} className="font-semibold text-slate-600 hover:underline">
                        Xem trang ưu đãi
                      </Link>
                    </div>
                  </div>

                  <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-500 lg:min-w-80">
                    <div>
                      <dt className="font-semibold text-slate-700">Xác minh gần nhất</dt>
                      <dd className="mt-1">{formatDate(offer.last_verified_at)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-700">Kiểm tra lại</dt>
                      <dd className="mt-1">{formatDate(due)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-700">Hết hạn</dt>
                      <dd className="mt-1">{formatDate(offer.expires_at)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-700">Chu kỳ</dt>
                      <dd className="mt-1">{offer.verification_interval_days} ngày</dd>
                    </div>
                  </dl>
                </div>

                {offer.verification_note ? (
                  <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                    Ghi chú lần trước: {offer.verification_note}
                  </p>
                ) : null}

                {offer.status === "draft" || state !== "expired" ? (
                  <form action={verifyOfferFreshness} className="mt-5 grid gap-3 border-t pt-5 md:grid-cols-4">
                    <input type="hidden" name="offerId" value={offer.id} />
                    <input
                      name="verificationNote"
                      placeholder="Ghi chú xác minh (tùy chọn)"
                      className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
                    />
                    <input
                      name="expiresOn"
                      type="date"
                      aria-label="Ngày hết hạn"
                      className="rounded-lg border px-3 py-2 text-sm"
                    />
                    <select
                      name="verificationIntervalDays"
                      defaultValue={String(offer.verification_interval_days || 90)}
                      className="rounded-lg border px-3 py-2 text-sm"
                      aria-label="Chu kỳ xác minh"
                    >
                      <option value="30">30 ngày</option>
                      <option value="60">60 ngày</option>
                      <option value="90">90 ngày</option>
                      <option value="180">180 ngày</option>
                      <option value="365">365 ngày</option>
                    </select>
                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white md:col-span-4">
                      Xác nhận nguồn chính thức vẫn hợp lệ
                    </button>
                  </form>
                ) : null}
              </article>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed p-8 text-sm text-slate-500">
            Chưa có ưu đãi nào cần theo dõi.
          </p>
        )}
      </div>
    </main>
  );
}

function Summary({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between text-slate-500">
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}
