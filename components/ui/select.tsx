import * as React from "react";
import { cn } from "@/lib/utils";

/** Native select preserves server form submissions, keyboard behavior and zero JS hydration. */
export function Select({className, ...props}: React.ComponentProps<"select">) {
  return <select data-slot="select" className={cn("min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 disabled:opacity-50",className)} {...props}/>;
}
