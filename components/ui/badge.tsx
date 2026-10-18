import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-snug",{
  variants:{variant:{
    default:"border-transparent bg-blue-50 text-blue-700",
    secondary:"border-slate-200 bg-slate-100 text-slate-700",
    success:"border-emerald-100 bg-emerald-50 text-emerald-700",
    warning:"border-amber-100 bg-amber-50 text-amber-800",
    destructive:"border-red-100 bg-red-50 text-red-700",
    outline:"border-slate-200 bg-white text-slate-700"
  }},defaultVariants:{variant:"default"}
});
export function Badge({className,variant,...props}:React.ComponentProps<"span">&VariantProps<typeof badgeVariants>){
  return <span data-slot="badge" className={cn(badgeVariants({variant}),className)} {...props}/>;
}
export {badgeVariants};
