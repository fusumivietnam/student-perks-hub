import Link from "next/link";
import { archiveOffer, saveOffer } from "@/app/admin/actions";
type Category = { id: string; name: string };
type Offer = { id?:string; slug:string; title:string; provider:string; official_url:string; summary:string; category_id:string|null; benefit_type:string; benefit_text:string|null; status:string; is_featured:boolean };
export function OfferEditor({ categories, offer }: { categories: Category[]; offer?: Offer }) {
 const field="min-h-11 w-full rounded-xl border bg-white px-3 py-2";
 return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
 <Link href="/admin/content/offers" className="text-sm font-semibold text-primary">← Danh sách ưu đãi</Link>
 <h1 className="mt-3 text-3xl font-black">{offer?"Chỉnh sửa ưu đãi":"Tạo ưu đãi mới"}</h1>
 <p className="mt-2 text-sm text-slate-600">{offer ? "Chỉ chọn Xuất bản sau khi đã kiểm tra thông tin và liên kết." : "Ưu đãi mới luôn được lưu dưới dạng bản nháp. Mở lại bản ghi để chủ động xuất bản."}</p>
 <form action={saveOffer} className="mt-8 grid gap-6 rounded-2xl border bg-white p-5 sm:p-8">
 {offer?.id && <input type="hidden" name="id" value={offer.id}/>}
 <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-4 text-lg font-bold">Thông tin cơ bản</legend>
 <label className="grid gap-1.5 text-sm font-semibold">Tên ưu đãi<input className={field} required minLength={4} maxLength={180} name="title" defaultValue={offer?.title}/></label>
 <label className="grid gap-1.5 text-sm font-semibold">Nhà cung cấp<input className={field} required minLength={2} maxLength={120} name="provider" defaultValue={offer?.provider}/></label>
 <label className="grid gap-1.5 text-sm font-semibold">Slug<input className={field} required pattern="[a-z0-9]+(-[a-z0-9]+)*" name="slug" maxLength={160} defaultValue={offer?.slug}/></label>
 <label className="grid gap-1.5 text-sm font-semibold">Danh mục<select className={field} name="categoryId" defaultValue={offer?.category_id??""}><option value="">Chưa phân loại</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">URL chính thức (HTTPS)<input className={field} type="url" required name="officialUrl" defaultValue={offer?.official_url}/></label>
 <label className="grid gap-1.5 text-sm font-semibold sm:col-span-2">Tóm tắt<textarea className="min-h-28 rounded-xl border p-3" required minLength={10} maxLength={500} name="summary" defaultValue={offer?.summary}/></label>
 </fieldset>
 <fieldset className="grid gap-4 sm:grid-cols-2"><legend className="mb-4 text-lg font-bold">Quyền lợi & xuất bản</legend>
 <label className="grid gap-1.5 text-sm font-semibold">Loại ưu đãi<select className={field} name="benefitType" defaultValue={offer?.benefit_type??"free"}>{["free","discount","credit","trial","other"].map(s=><option key={s} value={s}>{s}</option>)}</select></label>
 <label className="grid gap-1.5 text-sm font-semibold">Thông tin quyền lợi<input className={field} maxLength={160} name="benefitText" defaultValue={offer?.benefit_text??""}/></label>
 <label className="grid gap-1.5 text-sm font-semibold">Trạng thái<select className={field} name="status" defaultValue={offer?.status??"draft"}>{["draft","published","expired","archived"].map(s=><option key={s} value={s}>{({draft:"Bản nháp",published:"Xuất bản",expired:"Hết hạn",archived:"Lưu trữ"} as Record<string,string>)[s]}</option>)}</select></label>
 <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" name="featured" defaultChecked={offer?.is_featured??false}/>Ưu đãi nổi bật</label>
 </fieldset>
 <div className="flex flex-wrap justify-end gap-3 border-t pt-5">{offer && offer.status !== "archived" ? <button type="submit" formAction={archiveOffer} formNoValidate className="min-h-11 rounded-xl border border-amber-300 px-5 font-semibold text-amber-800" aria-label="Lưu trữ ưu đãi">Lưu trữ</button> : null}<Link href="/admin/content/offers" className="inline-flex min-h-11 items-center rounded-xl border px-5 py-2">Hủy</Link><button className="min-h-11 rounded-xl bg-primary px-6 font-semibold text-white">Lưu ưu đãi</button></div>
 </form></main>;
}
