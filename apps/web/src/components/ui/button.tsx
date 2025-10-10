import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const button = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
  "disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
        outline:
          "border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-50 focus:ring-emerald-500",
        ghost:
          "text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
        secondary:
          "bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500",
        danger:
          "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500"
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button> & { isLoading?: boolean };

export function Button({
  className,
  variant,
  size,
  isLoading,
  children,
  ...props
}: Props) {
  return (
    <button
      className={cn(button({ variant, size }), className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-white/60" />
      )}
      {children}
    </button>
  );
}
