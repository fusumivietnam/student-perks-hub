import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, CheckCircle2, ClipboardCheck, FolderOpen, LayoutDashboard, Search, ShieldCheck, Sparkles, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Concept F | UI Studio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const sampleOffers = [
  { title: "Tên ưu đãi minh họa", category: "Công nghệ", detail: "Điều kiện sinh viên", tone: "bg-violet-100" },
  { title: "Ưu đãi học tập minh họa", category: "Giáo dục", detail: "Kiểm tra nguồn chính thức", tone: "bg-emerald-100" },
  { title: "Ưu đãi phần mềm minh họa", category: "Phần mềm", detail: "Quyền lợi theo chương trình", tone: "bg-rose-100" },
];
const previewMetricLabels = [
  { label: "Ưu đãi", icon: FolderOpen },
  { label: "Danh mục", icon: Tags },
  { label: "Đề xuất chờ duyệt", icon: ClipboardCheck },
  { label: "Xác minh chờ duyệt", icon: ShieldCheck },
];
const colors = [
  { name: "Brand", hex: "#743AFF" },
  { name: "Pink accent", hex: "#FF3985" },
  { name: "Mint", hex: "#12B886" },
  { name: "Warning", hex: "#FF9F1C" },
  { name: "Navy", hex: "#0B1742" },
  { name: "Surface", hex: "#F8F7FC" },
];

function PublicSample() {
  return (
    <div className="overflow-hidden rounded-3xl border border-violet-100 bg-[#F8F7FC] text-[#0B1742]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2 font-extrabold"><span className="rounded-xl bg-[#743AFF] px-2 py-1 text-white">SP</span> Student Perks Hub</div>
        <span className="text-xs font-semibold text-[#743AFF]">Public / Concept F</span>
      </header>
      <section className="m-4 rounded-3xl bg-[#F0E9FF] px-5 py-9 sm:m-7 sm:px-10 sm:py-14">
        <Badge className="bg-white text-[#743AFF]"><Sparkles className="size-3.5" aria-hidden="true"/> Dành cho sinh viên</Badge>
        <h3 className="mt-5 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">Học nhiều hơn.<br/><span className="text-[#743AFF]">Tiết kiệm nhiều hơn.</span></h3>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#475473]">Khám phá ưu đãi về công nghệ, học tập và phần mềm. Đây là bố cục minh họa, chưa kết nối dữ liệu.</p>
        <div className="mt-6 flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-sm sm:flex-row">
          <Input aria-label="Tìm ưu đãi minh họa" placeholder="Tìm ưu đãi, thương hiệu..." className="min-w-0 flex-1 border-0 shadow-none" readOnly />
          <Button type="button" disabled className="bg-[#743AFF]"> <Search className="size-4"/> Tìm kiếm</Button>
        </div>
      </section>
      <section className="px-5 pb-8 sm:px-8">
        <div className="mb-4 flex items-center justify-between"><h4 className="text-xl font-extrabold">Ưu đãi nổi bật</h4><span className="text-xs text-[#743AFF]">Mẫu thiết kế</span></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {sampleOffers.map((offer) => <Card key={offer.title} className="gap-2 border-violet-100 p-3">
            <div className={`flex h-24 items-center justify-center rounded-xl ${offer.tone}`}><BookOpen className="size-9 text-[#743AFF]" aria-hidden="true"/></div>
            <Badge variant="outline" className="w-fit">{offer.category}</Badge>
            <p className="font-bold">{offer.title}</p><p className="text-xs text-slate-500">{offer.detail}</p>
          </Card>)}
        </div>
      </section>
    </div>
  );
}

function AdminSample() {
  return (
    <div className="grid overflow-hidden rounded-3xl border border-violet-100 bg-[#F8F7FC] text-[#0B1742] md:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="hidden min-h-[520px] bg-[#0B1742] px-4 py-6 text-white md:block">
        <p className="mb-8 text-sm font-extrabold">✦ Student Perks</p>
        <div className="space-y-2 text-xs">
          <p className="rounded-xl bg-[#34275B] p-3 font-semibold">Tổng quan</p>
          <p className="p-3 text-slate-300">Quản lý ưu đãi</p>
          <p className="p-3 text-slate-300">Danh mục</p>
          <p className="p-3 text-slate-300">Đề xuất</p>
          <p className="p-3 text-slate-300">Xác minh sinh viên</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b bg-white px-5 py-4 text-sm font-bold"><span>Không gian quản trị</span><LayoutDashboard className="size-5 text-[#743AFF]"/></header>
        <div className="p-5 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#743AFF]">Admin / Concept F</p>
          <h3 className="mt-2 text-2xl font-black">Tổng quan quản trị</h3>
          <p className="mt-1 text-xs text-slate-500">Khung dữ liệu vận hành — không sử dụng KPI giả.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {previewMetricLabels.map(({label,icon:Icon})=><Card key={label} className="gap-3 p-4"><Icon className="size-5 text-[#743AFF]"/><p className="text-xs font-semibold">{label}</p><span className="text-xl font-bold text-slate-400">—</span></Card>)}
          </div>
          <Card className="mt-6 gap-4 p-5"><h4 className="font-bold">Hàng đợi xử lý</h4>
            {["Đề xuất cần duyệt", "Yêu cầu xác minh sinh viên", "Ưu đãi cần rà soát"].map((name)=><div key={name} className="flex items-center justify-between gap-2 border-t py-2 text-sm"><span>{name}</span><Badge variant="secondary">Dữ liệu thực khi kết nối</Badge></div>)}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function UiStudioPage() {
  // Deliberately unavailable in Preview and Production deployments.
  if (process.env.NODE_ENV !== "development") notFound();
  return <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-8">
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-wider text-violet-700">Design workbench / local only</p><h1 className="mt-2 text-3xl font-black">Concept F — UI Studio</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Mẫu tương tác bằng component thật. Không phải trang sản phẩm, không kết nối dữ liệu hoặc hành động ghi dữ liệu.</p></div>
      <Badge variant="warning">Chưa nghiệm thu thị giác</Badge>
    </div>
    <section aria-labelledby="studio-tokens"><h2 id="studio-tokens" className="text-xl font-bold">01. Design tokens đề xuất</h2><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{colors.map(c=><Card key={c.name} className="gap-2 p-3"><div className="h-16 rounded-xl" style={{backgroundColor:c.hex}}/><p className="text-xs font-semibold">{c.name}</p><code className="text-xs text-slate-500">{c.hex}</code></Card>)}</div></section>
    <section aria-labelledby="studio-public" className="mt-12"><h2 id="studio-public" className="mb-4 text-xl font-bold">02. Public Homepage — bố cục tham chiếu</h2><PublicSample/></section>
    <section aria-labelledby="studio-admin" className="mt-12"><h2 id="studio-admin" className="mb-4 text-xl font-bold">03. Admin Dashboard — bố cục tham chiếu</h2><AdminSample/></section>
    <p className="mt-8 flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="size-4"/> Không có form ghi dữ liệu, quyền Admin giả, hoặc kết nối Production.</p>
    <p className="mt-2 text-xs text-slate-500">Các màn hình này chỉ là điểm khởi đầu để so sánh với Figma và duyệt trên trình duyệt local; không phải baseline đã khóa.</p>
  </div>;
}
