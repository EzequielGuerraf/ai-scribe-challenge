import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full rounded-md border border-gray-300 p-3", props.className)} />;
}
