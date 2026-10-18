import { OfferEditor } from "@/components/admin/offer-editor";
import { createClient } from "@/lib/supabase/server";
export default async function NewOfferPage(){const db=await createClient();const r=await db.from("categories").select("id,name").order("name");if(r.error)throw new Error("Could not load categories");return <OfferEditor categories={r.data??[]}/>;}
