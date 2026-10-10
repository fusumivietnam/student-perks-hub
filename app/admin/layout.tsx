import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentAdmin } from "@/lib/admin";
import { getCurrentAuth } from "@/lib/auth";

const adminNav = [
  { href: "/admin", label: "Content" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/verifications", label: "Xác minh sinh viên" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getCurrentAuth();
  if (!auth) redirect("/login?next=/admin");

  const admin = await getCurrentAdmin();
  if (!admin) notFound();

  return (
    <div>
      <nav className="border-b bg-slate-950 text-white" aria-label="Điều hướng quản trị">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
