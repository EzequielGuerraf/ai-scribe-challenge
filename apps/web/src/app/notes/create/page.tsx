"use client";
/**
 * A single page to create text and audio notes.
 * Keeps the MVP simple and review-friendly.
 */
import { useState } from "react";
import { usePatients } from "@/hooks/usePatients";
import { useCreateTextNote, useUploadAudio } from "@/hooks/useNotes";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FormRow } from "@/components/forms/formRow";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textArea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateNote() {
  const { data: patients } = usePatients();

  // Text note state
  const [textPid, setTextPid] = useState("");
  const [sourceText, setSourceText] = useState("");
  const createText = useCreateTextNote();

  // Audio note state
  const [audioPid, setAudioPid] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const uploadAudio = useUploadAudio();

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader title="Create Note (Text)" />
        <CardBody className="space-y-3">
          <FormRow label="Patient">
            <Select value={textPid} onChange={e => setTextPid(e.target.value)}>
              <option value="">Select patient…</option>
              {patients?.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </Select>
          </FormRow>
          <FormRow label="Note text">
            <Textarea rows={4} value={sourceText} onChange={e => setSourceText(e.target.value)} placeholder="Type the raw note text..." />
          </FormRow>
          <Button
            onClick={() => createText.mutate({ patientId: textPid, sourceText })}
            disabled={!textPid || !sourceText || createText.isPending}
          >
            {createText.isPending ? "Creating..." : "Create text note"}
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Create Note (Audio)" />
        <CardBody className="space-y-3">
          <FormRow label="Patient">
            <Select value={audioPid} onChange={e => setAudioPid(e.target.value)}>
              <option value="">Select patient…</option>
              {patients?.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </Select>
          </FormRow>
          <FormRow label="Audio file">
            <Input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          </FormRow>
          <Button
            variant="outline"
            onClick={() => file && uploadAudio.mutate({ patientId: audioPid, file })}
            disabled={!audioPid || !file || uploadAudio.isPending}
          >
            {uploadAudio.isPending ? "Uploading..." : "Upload audio"}
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
