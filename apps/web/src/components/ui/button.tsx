import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const button = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-black/10",
  {
    variants: {
      variant: {
        primary: "bg-black text-white hover:bg-black/90",
        outline: "border border-gray-300 bg-white hover:bg-gray-50",
        ghost: "hover:bg-gray-100"
      },
      size: { sm: "h-8 px-3", md: "h-10 px-4", lg: "h-11 px-5" }
    },
    defaultVariants: { variant: "primary", size: "md" }
  }
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button> & { isLoading?: boolean };

export function Button({ className, variant, size, isLoading, children, ...props }: Props) {
  return (
    <button className={cn(button({ variant, size }), className)} disabled={isLoading || props.disabled} {...props}>
      {isLoading && <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-current" />}
      {children}
    </button>
  );
}
