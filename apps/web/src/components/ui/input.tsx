import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("text-gray-400 w-full rounded-md border border-gray-400 px-3 h-10", props.className)} />;
}
