import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  showName?: boolean;
};

export function BrandLogo({ className = "", showName = true }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight ${className}`}
      aria-label="Student Perks Hub — Trang chủ"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <svg
          viewBox="0 0 32 32"
          className="size-6"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5.5 10.5 16 5l10.5 5.5L16 16 5.5 10.5Z"
            fill="currentColor"
          />
          <path
            d="M9 13.2v5.2c0 2.7 3.1 4.9 7 4.9s7-2.2 7-4.9v-5.2"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M26.5 10.7v7.4"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="26.5" cy="20.8" r="1.7" fill="currentColor" />
        </svg>
      </span>
      {showName ? <span>Student Perks Hub</span> : null}
    </Link>
  );
}
