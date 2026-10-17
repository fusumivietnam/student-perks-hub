import type { Metadata } from "next";
import Link from "next/link";

import { submitOffer } from "@/app/submit/actions";
import { getCurrentAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Gửi một ưu đãi",
  description: "Đề xuất một chương trình ưu đãi để được kiểm tra trước khi publish.",
  alternates: { canonical: "/submit" },
};

type SubmitPageProps = {
  searchParams: Promise<{
    success?: string | string[];
    error?: string | string[];
  }>;
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const errorCopy: Record<string, string> = {
  invalid: "Vui lòng kiểm tra lại nhà cung cấp, tên ưu đãi và link chính thức.",
  duplicate:
    "Link này đã có một đề xuất đang được xử lý hoặc đã được duyệt. Không cần gửi lại.",
  unavailable: "Chưa thể gửi đề xuất lúc này. Vui lòng thử lại sau.",
};

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const [auth, params] = await Promise.all([getCurrentAuth(), searchParams]);

  const success = one(params.success);
  const errorCode = one(params.error);

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-primary">Cộng đồng</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        Gửi một ưu đãi
      </h1>
      <p className="mt-4 leading-7 text-slate-600">
        Gửi link chính thức để đội ngũ kiểm tra. Submission luôn bắt đầu ở trạng
        thái pending và không được publish trực tiếp.
      </p>

      <div className="mt-4 rounded-xl border bg-slate-50 p-4 text-sm text-slate-600">
        {auth ? (
          <>
            Đang gửi với tài khoản <strong className="text-slate-950">{auth.email ?? "đã đăng nhập"}</strong>.
            Sau khi gửi, bạn sẽ được chuyển thẳng tới lịch sử đề xuất để theo dõi trạng thái.
          </>
        ) : (
          <>
            Bạn có thể gửi ẩn danh, nhưng đề xuất ẩn danh không xuất hiện trong lịch sử tài khoản sau này. {" "}
            <Link
              href="/login?next=/submit"
              className="font-semibold text-primary underline underline-offset-4"
            >
              Đăng nhập trước khi gửi
            </Link>{" "}
            nếu muốn theo dõi vòng đời đề xuất.
          </>
        )}
      </div>

      {success ? (
        <div
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          role="status"
        >
          <p>Đã nhận đề xuất. Offer chỉ được publish sau khi được kiểm tra.</p>
        </div>
      ) : null}

      {errorCode ? (
        <div
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {errorCopy[errorCode] ?? errorCopy.unavailable}
        </div>
      ) : null}

      <form action={submitOffer} className="mt-8 grid gap-5 rounded-2xl border bg-white p-6 shadow-sm">
        <label className="grid gap-1.5 text-sm font-medium">
          Nhà cung cấp
          <input
            name="provider"
            required
            minLength={2}
            maxLength={120}
            placeholder="GitHub, Notion, Microsoft..."
            className="rounded-xl border px-3 py-2.5"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium">
          Tên ưu đãi
          <input
            name="title"
            required
            minLength={4}
            maxLength={180}
            className="rounded-xl border px-3 py-2.5"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium">
          Link chính thức
          <input
            type="url"
            name="officialUrl"
            required
            maxLength={1000}
            placeholder="https://..."
            className="rounded-xl border px-3 py-2.5"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium">
          Mô tả
          <textarea
            name="description"
            rows={5}
            maxLength={3000}
            placeholder="Quyền lợi, điều kiện và đối tượng áp dụng..."
            className="rounded-xl border px-3 py-2.5"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium">
          Ghi chú cho người kiểm duyệt
          <textarea
            name="submitterNote"
            rows={3}
            maxLength={1500}
            className="rounded-xl border px-3 py-2.5"
          />
        </label>

        <button className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
          Gửi đề xuất
        </button>
      </form>
    </section>
  );
}
