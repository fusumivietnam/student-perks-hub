export default function OffersLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-10 w-64 animate-pulse rounded bg-slate-200" />
      <div className="mt-8 h-14 w-full animate-pulse rounded-2xl bg-slate-100" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-2xl border bg-slate-50"
          />
        ))}
      </div>
    </section>
  );
}
