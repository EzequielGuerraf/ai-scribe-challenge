"use client";
import { StatusBadge } from "@/components/ui/statusBadge";
import type { Note } from "@/lib/types";

/** Clean note list with better spacing and visual rhythm. */
export function NoteList({ items, onOpen, actions }: { items: Note[]; onOpen: (id: string) => void; actions?: (note: Note) => React.ReactNode; }) {
  return (
    <ul className="space-y-3">
      {items.map(n => (
        <li key={n.id} className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <StatusBadge status={n.status} />
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">Type: <span className="font-medium">{n.inputType}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm text-blue-600 underline underline-offset-2" onClick={() => onOpen(n.id)}>
                Open →
              </button>
              {actions ? actions(n) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
