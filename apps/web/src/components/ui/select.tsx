import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("text-gray-400 w-full rounded-md border border-gray-400 h-10 px-3", props.className)} />;
}
