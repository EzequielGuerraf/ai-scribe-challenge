"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormRow } from "@/components/forms/formRow";

/** Reusable patient form for create/edit flows. */
type PatientFormProps = {
  initial?: { firstName?: string; lastName?: string; mrn?: string; dob?: string };
  submitLabel?: string;
  onSubmit: (data: { firstName: string; lastName: string; mrn: string; dob?: string }) => void;
  isSubmitting?: boolean;
};

export function PatientForm({ initial, submitLabel = "Save", onSubmit, isSubmitting }: PatientFormProps) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [mrn, setMrn] = useState(initial?.mrn ?? "");
  const [dob, setDob] = useState(initial?.dob ?? ""); // yyyy-mm-dd

  return (
    <div className="space-y-3">
      <FormRow label="First name">
        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
      </FormRow>
      <FormRow label="Last name">
        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
      </FormRow>
      <FormRow label="MRN">
        <Input value={mrn} onChange={(e) => setMrn(e.target.value)} placeholder="MRN001" />
      </FormRow>
      <FormRow label="Date of birth">
        <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
      </FormRow>

      <Button
        onClick={() => onSubmit({ firstName, lastName, mrn, dob: dob || undefined })}
        disabled={!firstName || !lastName || !mrn || isSubmitting}
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </div>
  );
}
