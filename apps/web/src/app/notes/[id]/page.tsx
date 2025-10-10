"use client";

import { useParams, useRouter } from "next/navigation";
import { useNoteDetail } from "@/hooks/useNotes";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function NoteDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: note, isLoading, isError, refetch } = useNoteDetail(id);

  if (isLoading) {
    return (
      <main className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Spinner /> Loading note…
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6 space-y-4">
        <div className="text-sm text-red-700">Failed to load note.</div>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="p-6 space-y-3">
        <div className="text-sm text-gray-600">Note not found.</div>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">Note Detail</h1>
          <p className="text-sm text-gray-500">
            ID: {note.id} • {new Date(note.createdAt).toLocaleString()} • Type: {note.inputType} • Status: {note.status}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      <Card>
        <CardHeader title="Overview" />
        <CardBody className="space-y-1 text-sm text-gray-700">
          <div><span className="text-gray-500">Patient ID:</span> {note.patientId}</div>
          {note.audioFilename && <div><span className="text-gray-500">Audio file:</span> {note.audioFilename}</div>}
        </CardBody>
      </Card>

      {note.sourceText && (
        <Card>
          <CardHeader title="Source Text" />
          <CardBody>
            <pre className="whitespace-pre-wrap rounded border bg-white p-3 text-sm">
              {note.sourceText}
            </pre>
          </CardBody>
        </Card>
      )}

      {note.transcript && (
        <Card>
          <CardHeader title="Transcript" />
          <CardBody>
            <pre className="whitespace-pre-wrap rounded border bg-white p-3 text-sm">
              {note.transcript}
            </pre>
          </CardBody>
        </Card>
      )}

      {note.generatedNote && (
        <Card>
          <CardHeader title="Generated (SOAP)" />
          <CardBody>
            <pre className="whitespace-pre-wrap rounded border bg-white p-3 text-sm">
              {note.generatedNote}
            </pre>
          </CardBody>
        </Card>
      )}

      {!note.sourceText && !note.transcript && !note.generatedNote && (
        <div className="text-sm text-gray-500">
          No content yet. Try “Transcribe” and “Generate SOAP” from the patient’s notes page.
        </div>
      )}
    </main>
  );
}
