"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PatientForm } from "@/components/patients/patientForm"; 
import { usePatient, useUpdatePatient, useDeletePatient } from "@/hooks/usePatients";
import { Button } from "@/components/ui/button";

export default function EditPatientPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  // Fetch patient by ID via dedicated hook (calls GET /patients/:id)
  const { data: patient, isLoading, isError, refetch } = usePatient(id);

  const update = useUpdatePatient();
  const del = useDeletePatient();

  if (isLoading) {
    return <main className="p-6 text-sm text-gray-500">Loading…</main>;
  }

  if (isError) {
    return (
      <main className="p-6 space-y-3">
        <div className="text-sm text-red-700">Failed to load patient.</div>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </main>
    );
  }

  if (!patient) {
    return <main className="p-6 text-sm text-gray-500">Patient not found.</main>;
  }

  // Normalize DOB to yyyy-mm-dd for <input type="date" />
  const initial = {
    firstName: patient.firstName,
    lastName: patient.lastName,
    mrn: patient.mrn,
    dob: patient.dob ? new Date(patient.dob).toISOString().slice(0, 10) : "",
  };

  return (
    <main className="p-6 space-y-4">
      <Card>
        <CardHeader
          title="Edit Patient"
          subtitle={`Editing ${patient.firstName} ${patient.lastName}`}
        />
        <CardBody className="space-y-4">
          <PatientForm
            initial={initial}
            submitLabel="Save changes"
            isSubmitting={update.isPending}
            onSubmit={(payload) =>
              update.mutate(
                { id, data: payload },
                { onSuccess: () => router.push(`/patients/${id}`) }
              )
            }
          />

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                del.mutate(id, { onSuccess: () => router.push("/") })
              }
            >
              Delete patient
            </Button>
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
