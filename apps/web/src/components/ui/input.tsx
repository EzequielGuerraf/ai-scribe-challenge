import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-md border border-gray-300 px-3 h-10", props.className)} />;
}
