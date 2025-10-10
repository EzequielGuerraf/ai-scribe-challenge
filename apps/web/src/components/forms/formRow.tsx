import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormRow({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint ? <p className="text-xs text-gray-500">{hint}</p> : null}
      <div className="mt-1">{children}</div>
    </div>
  );
}
