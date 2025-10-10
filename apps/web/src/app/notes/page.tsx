"use client";
/**
 * Note detail page: shows raw source, transcript and generated SOAP.
 */
import { useParams } from "next/navigation";
import { useNoteDetail } from "@/hooks/useNotes";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function NoteDetail() {
  const params = useParams<{ id: string }>();
  const { data: note, isLoading } = useNoteDetail(params.id);

  if (isLoading) return <div className="p-6"><Spinner /></div>;
  if (!note) return <div className="p-6">Not found</div>;

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader title="Note Detail" />
        <CardBody className="space-y-4">
          {note.sourceText && (
            <section>
              <h3 className="font-semibold mb-1">Source Text</h3>
              <pre className="whitespace-pre-wrap rounded border bg-white p-3">{note.sourceText}</pre>
            </section>
          )}
          {note.transcript && (
            <section>
              <h3 className="font-semibold mb-1">Transcript</h3>
              <pre className="whitespace-pre-wrap rounded border bg-white p-3">{note.transcript}</pre>
            </section>
          )}
          {note.generatedNote && (
            <section>
              <h3 className="font-semibold mb-1">Generated (SOAP)</h3>
              <pre className="whitespace-pre-wrap rounded border bg-white p-3">{note.generatedNote}</pre>
            </section>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
