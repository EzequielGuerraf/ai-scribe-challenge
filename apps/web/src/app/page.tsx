"use client";
/**
 * Lists seeded patients with link to their notes.
 * Clear, simple, and easy to scan.
 */
import { usePatients } from "@/hooks/usePatients";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const { data, isLoading } = usePatients();

  if (isLoading) return <div className="p-6"><Spinner /></div>;

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader title="Patients" subtitle="Seeded on first run" />
        <CardBody>
          {!data?.length && <div className="text-sm text-gray-500">No patients found.</div>}
          <ul className="divide-y">
            {data?.map(p => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.firstName} {p.lastName}</div>
                  <div className="text-sm text-gray-500">MRN: {p.mrn}</div>
                </div>
                <a className="text-blue-600 hover:underline text-sm" href={`/patients/${p.id}`}>View notes →</a>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </main>
  );
}
