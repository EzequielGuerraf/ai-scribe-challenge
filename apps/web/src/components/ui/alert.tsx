export function Alert({ variant = "info", children, className }: { variant?: "info" | "success" | "error" | "warning"; children: React.ReactNode; className?: string }) {
  const map = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green-200 bg-green-50 text-green-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-800"
  } as const;

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${map[variant]} ${className || ""}`}>
      {children}
    </div>
  );
}
