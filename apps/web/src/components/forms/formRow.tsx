import type { ReactNode } from "react";

export function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-gray-700">{label}</span>
      {children}
    </label>
  );
}
