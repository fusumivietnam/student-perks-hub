export type FreshnessState = "expired" | "unverified" | "stale" | "due-soon" | "fresh";

export type OfferFreshnessFields = {
  last_verified_at: string | null;
  verification_interval_days: number;
  expires_at: string | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function offerRecheckDueAt(offer: OfferFreshnessFields) {
  if (!offer.last_verified_at) return null;

  return new Date(
    new Date(offer.last_verified_at).getTime() + offer.verification_interval_days * DAY_MS,
  ).toISOString();
}

export function classifyOfferFreshness(offer: OfferFreshnessFields): FreshnessState {
  const now = Date.now();

  if (offer.expires_at && new Date(offer.expires_at).getTime() <= now) return "expired";
  if (!offer.last_verified_at) return "unverified";

  const dueAt = new Date(offer.last_verified_at).getTime() + offer.verification_interval_days * DAY_MS;
  if (dueAt <= now) return "stale";
  if (dueAt <= now + 14 * DAY_MS) return "due-soon";
  return "fresh";
}
