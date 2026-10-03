import type { Metadata } from "next";
import { BadgeCheck, Clock3, GraduationCap, MailCheck, ShieldCheck, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

import { requestStudentVerification } from "@/app/verification/actions";
import { getCurrentAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Xác minh sinh viên",
  robots: { index: false, follow: false },
};

type VerificationPageProps = {
  searchParams: Promise<{
    success?: string | string[];
    error?: string | string[];
  }>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const statusCopy = {
  pending: {
    label: "Đang chờ duyệt",
    description: "Đội ngũ đang kiểm tra tên tổ chức và email tài khoản của bạn.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    Icon: Clock3,
  },
  verified: {
    label: "Đã xác minh",
    description: "Tài khoản của bạn đã được xác minh là sinh viên.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Icon: BadgeCheck,
  },
  rejected: {
    label: "Chưa thể xác minh",
    description: "Yêu cầu trước chưa đủ điều kiện. Bạn có thể gửi lại thông tin mới.",
    className: "border-red-200 bg-red-50 text-red-800",
    Icon: XCircle,
  },
  expired: {
    label: "Đã hết hạn",
    description: "Trạng thái xác minh đã hết hạn. Bạn có thể yêu cầu xác minh lại.",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    Icon: Clock3,
  },
} as const;

export default async function VerificationPage({ searchParams }: VerificationPageProps) {
  const [auth, params] = await Promise.all([getCurrentAuth(), searchParams]);
  if (!auth?.email) redirect("/login?next=/verification");

  const supabase = await createClient();
  const { data: verification, error: verificationError } = await supabase
    .from("student_verifications")
    .select("id,institution_name,verification_email,status,created_at,reviewed_at,expires_at")
    .eq("user_id", auth.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (verificationError) throw new Error("Could not load verification status");

  const success = one(params.success);
  const error = one(params.error);
  const status = verification
    ? statusCopy[verification.status as keyof typeof statusCopy]
    : null;
  const canRequest = !verification || verification.status === "rejected" || verification.status === "expired";

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 shadow-sm sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">Quyền lợi sinh viên</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Xác minh sinh viên</h1>
            <p className="mt-4 leading-7 text-slate-600">
              Xác nhận trạng thái sinh viên bằng email tài khoản và tên trường/tổ chức. MVP không yêu cầu tải giấy tờ hoặc ảnh cá nhân.
            </p>
          </div>
          <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-primary text-white shadow-sm">
            <GraduationCap className="size-10" aria-hidden="true" />
          </div>
        </div>
      </div>

      {success ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Đã gửi yêu cầu xác minh. Bạn có thể quay lại trang này để theo dõi trạng thái.
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-primary">Trạng thái hiện tại</p>
          {verification && status ? (
            <div className="mt-4">
              <div className={`flex items-start gap-3 rounded-2xl border p-4 ${status.className}`}>
                <status.Icon className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
                <div>
                  <h2 className="font-bold">{status.label}</h2>
                  <p className="mt-1 text-sm opacity-90">{status.description}</p>
                </div>
              </div>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-slate-500">Trường / tổ chức</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{verification.institution_name}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-slate-500">Email xác minh</dt>
                  <dd className="mt-1 break-all font-semibold text-slate-950">{verification.verification_email}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-slate-500">Ngày gửi</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(verification.created_at))}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <dt className="text-slate-500">Hiệu lực đến</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {verification.expires_at
                      ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(verification.expires_at))
                      : "Chưa áp dụng"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
              <ShieldCheck className="mx-auto size-9 text-slate-400" aria-hidden="true" />
              <h2 className="mt-3 font-bold">Chưa có yêu cầu xác minh</h2>
              <p className="mt-1 text-sm text-slate-500">Gửi tên trường/tổ chức để bắt đầu quy trình.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-primary">
              <MailCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">Yêu cầu xác minh</p>
              <h2 className="font-bold">Thông tin tổ chức</h2>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Email tài khoản được dùng làm email xác minh: <strong className="text-slate-950">{auth.email}</strong>
          </div>

          {canRequest ? (
            <form action={requestStudentVerification} className="mt-5 grid gap-4">
              <label className="grid gap-1.5 text-sm font-medium">
                Tên trường hoặc tổ chức giáo dục
                <input
                  name="institutionName"
                  required
                  minLength={2}
                  maxLength={200}
                  placeholder="Ví dụ: Đại học Bách khoa Hà Nội"
                  className="rounded-xl border px-3 py-2.5"
                />
              </label>
              <button className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Gửi yêu cầu xác minh</button>
              <p className="text-xs leading-5 text-slate-500">
                Không tải giấy tờ cá nhân trong phiên bản này. Trạng thái chỉ thay đổi sau khi admin review.
              </p>
            </form>
          ) : (
            <p className="mt-5 rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
              Bạn đã có yêu cầu đang hoạt động. Không cần gửi thêm cho đến khi trạng thái thay đổi.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
