"use client";
/*Displays all notes for a specific patient with quick actions.*/
import { useParams } from "next/navigation";
import { usePatientNotes } from "@/hooks/useNotes";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { NoteActions } from "@/components/notes/noteActions";
import { StatusBadge } from "@/components/ui/statusBadge";

export default function PatientNotes() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, refetch } = usePatientNotes(params.id);

  if (isLoading) return <div className="p-6"><Spinner /></div>;

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader title="Notes" subtitle="Click a note to open detail" />
        <CardBody>
          {!data?.length && <div className="text-sm text-gray-500">No notes yet for this patient.</div>}
          <ul className="space-y-3">
            {data?.map(n => (
              <li key={n.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                  <div className="font-medium flex items-center gap-2">
                    Status: <StatusBadge status={n.status} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <a className="text-blue-600 hover:underline text-sm" href={`/notes/${n.id}`}>Open →</a>
                  <NoteActions id={n.id} onDone={() => refetch()} />
                </div>
              </li>
            ))}
          </ul>
          <button className="mt-4 text-sm underline" onClick={() => refetch()}>Refresh</button>
        </CardBody>
      </Card>
    </main>
  );
}
