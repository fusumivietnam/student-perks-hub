export default function GlobalLoading() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      aria-label="Đang tải nội dung"
      aria-busy="true"
    >
      <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-10 w-72 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-2xl border bg-slate-50"
          />
        ))}
      </div>
    </section>
  );
}
