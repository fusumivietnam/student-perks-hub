import * as React from "react";
import { cn } from "@/lib/utils";
export function Textarea({className,...props}: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn("min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:opacity-50",className)} {...props}/>;
}
