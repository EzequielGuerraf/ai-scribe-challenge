export function EmptyState({ title = "Nothing here yet", hint, className }: { title?: string; hint?: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-dashed bg-white p-8 text-center text-sm text-gray-700 ${className || ""}`}>
      <div className="font-medium">{title}</div>
      {hint && <div className="mt-1 text-gray-500">{hint}</div>}
    </div>
  );
}
