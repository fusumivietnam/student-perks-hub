import { notFound } from "next/navigation";
import { OfferEditor } from "@/components/admin/offer-editor";
import { createClient } from "@/lib/supabase/server";
export default async function EditOfferPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const db=await createClient();const [offer,categories]=await Promise.all([db.from("offers").select("id,slug,title,provider,summary,official_url,category_id,benefit_type,benefit_text,status,is_featured").eq("id",id).maybeSingle(),db.from("categories").select("id,name").order("name")]);if(offer.error||categories.error)throw new Error("Could not load offer editor");if(!offer.data)notFound();return <OfferEditor categories={categories.data??[]} offer={offer.data}/>;}
