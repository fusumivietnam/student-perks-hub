import * as React from "react";
import { cn } from "@/lib/utils";
export function Table({className,...props}:React.ComponentProps<"table">){return <table data-slot="table" className={cn("w-full caption-bottom text-left text-sm",className)} {...props}/>;}
export function TableHeader({className,...props}:React.ComponentProps<"thead">){return <thead data-slot="table-header" className={cn("bg-slate-50 text-slate-600 [&_tr]:border-b",className)} {...props}/>;}
export function TableBody({className,...props}:React.ComponentProps<"tbody">){return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0",className)} {...props}/>;}
export function TableRow({className,...props}:React.ComponentProps<"tr">){return <tr data-slot="table-row" className={cn("border-b border-slate-100 transition-colors hover:bg-blue-50/40",className)} {...props}/>;}
export function TableHead({className,...props}:React.ComponentProps<"th">){return <th data-slot="table-head" className={cn("h-11 px-4 text-left font-semibold align-middle",className)} {...props}/>;}
export function TableCell({className,...props}:React.ComponentProps<"td">){return <td data-slot="table-cell" className={cn("px-4 py-3 align-middle",className)} {...props}/>;}
