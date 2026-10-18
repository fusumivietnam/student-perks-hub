import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  { variants: {
    variant: {
      default: "bg-primary text-white hover:bg-blue-700",
      secondary: "bg-slate-100 text-slate-950 hover:bg-slate-200",
      outline: "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      ghost: "text-slate-700 hover:bg-slate-100"
    },
    size: { default: "px-4 py-2", sm: "min-h-9 px-3 py-1.5", lg: "min-h-12 px-6 py-3", icon: "size-11 p-0" }
  }, defaultVariants: { variant: "default", size: "default" } }
);
export function Button({ className, variant, size, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
export { buttonVariants };
