export default function CategoriesLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-10 w-72 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-6 w-full max-w-2xl animate-pulse rounded bg-slate-100" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border bg-slate-50"
          />
        ))}
      </div>
    </section>
  );
}
