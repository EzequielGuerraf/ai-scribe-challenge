"use client";
/*Actions for a note item. */

import { useGenerate, useTranscribe } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";

export function NoteActions({ id, onDone }: { id: string; onDone: () => void }) {
  const t = useTranscribe();
  const g = useGenerate();
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => t.mutate(id, { onSuccess: onDone })}>
        {t.isPending ? "Transcribing..." : "Transcribe"}
      </Button>
      <Button variant="outline" onClick={() => g.mutate(id, { onSuccess: onDone })}>
        {g.isPending ? "Generating..." : "Generate SOAP"}
      </Button>
    </div>
  );
}
