"use client";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { PatientForm } from "@/components/patients/patientForm";
import { useCreatePatient } from "@/hooks/usePatients";

export default function NewPatientPage() {
  const router = useRouter();
  const create = useCreatePatient();

  return (
    <main className="p-6">
      <Card>
        <CardHeader title="New Patient" subtitle="Create a new patient record" />
        <CardBody>
          <PatientForm
            onSubmit={(payload) =>
              create.mutate(payload, {
                onSuccess: () => router.push("/"),
              })
            }
            isSubmitting={create.isPending}
            submitLabel="Create patient"
          />
        </CardBody>
      </Card>
    </main>
  );
}
