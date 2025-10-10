"use client";

import { useMemo, useState } from "react";
import { usePatients } from "@/hooks/usePatients";
import { useCreateTextNote, useUploadAudio } from "@/hooks/useNotes";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { FormRow } from "@/components/forms/formRow";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textArea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const MAX_LEN = 2000;

export default function CreateNote() {
  const { data: patients, isLoading: loadingPatients } = usePatients();

  // Text note state
  const [textPid, setTextPid] = useState("");
  const [sourceText, setSourceText] = useState("");
  const createText = useCreateTextNote();
  const [textMsg, setTextMsg] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  // Audio note state
  const [audioPid, setAudioPid] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const uploadAudio = useUploadAudio();
  const [audioMsg, setAudioMsg] = useState<{ kind: "success" | "error"; msg: string } | null>(null);

  const textChars = sourceText.length;
  const textOver = textChars > MAX_LEN;

  const fileName = useMemo(() => file?.name || "", [file]);

  return (
    <main className="space-y-6 p-6">
      <div className="mb-2">
        <h1 className="text-xl font-semibold tracking-tight text-gray-600">Create Note</h1>
        <p className="text-sm text-gray-600">Create either a text or audio note and associate it with a patient.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/*TEXT NOTE*/}
        <Card>
          <CardHeader title="Create Note (Text)" subtitle="Paste or type the raw note text for AI processing later." />
          <CardBody className="space-y-4">
            {textMsg && (
              <Alert
                variant={textMsg.kind === "success" ? "success" : "error"}
                className="mb-1"
              >
                {textMsg.msg}
              </Alert>
            )}

            <FormRow label="Patient">
              <Select
                value={textPid}
                onChange={(e) => setTextPid(e.target.value)}
                aria-label="Select a patient for text note"
                disabled={loadingPatients || createText.isPending}
              >
                <option value="">{loadingPatients ? "Loading patients…" : "Select patient…"}</option>
                {patients?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </Select>
            </FormRow>

            <FormRow
              label="Note text"
              hint="Max 2000 characters. Include symptoms, duration, meds, vitals, and relevant context."
            >
              <div className="space-y-2">
                <Textarea
                  rows={6}
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="e.g. Patient reports sore throat and dry cough for 3 days. No fever. Took OTC ibuprofen with partial relief."
                  aria-label="Raw note text"
                  maxLength={MAX_LEN + 1}
                  className={textOver ? "border-rose-300" : ""}
                  disabled={createText.isPending}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {textOver ? (
                      <span className="text-rose-600 font-medium">Over limit</span>
                    ) : (
                      "Looks good"
                    )}
                  </span>
                  <span className={textOver ? "text-rose-600" : "text-gray-500"}>
                    {textChars}/{MAX_LEN}
                  </span>
                </div>
              </div>
            </FormRow>

            <div className="flex items-center gap-3">
              <Button
                onClick={async () => {
                  setTextMsg(null);
                  try {
                    await createText.mutateAsync({ patientId: textPid, sourceText });
                    setSourceText("");
                    setTextPid("");
                    setTextMsg({ kind: "success", msg: "Text note created successfully." });
                  } catch {
                    setTextMsg({ kind: "error", msg: "Failed to create text note." });
                  }
                }}
                disabled={!textPid || !sourceText || textOver}
                isLoading={createText.isPending}
              >
                Create text note
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSourceText("");
                  setTextPid("");
                  setTextMsg(null);
                }}
                disabled={createText.isPending}
              >
                Reset
              </Button>
            </div>
          </CardBody>
        </Card>

        {/*AUDIO NOTE*/}
        <Card>
          <CardHeader title="Create Note (Audio)" subtitle="Upload an audio file to transcribe and summarize later." />
          <CardBody className="space-y-4">
            {audioMsg && (
              <Alert
                variant={audioMsg.kind === "success" ? "success" : "error"}
                className="mb-1"
              >
                {audioMsg.msg}
              </Alert>
            )}

            <FormRow label="Patient">
              <Select
                value={audioPid}
                onChange={(e) => setAudioPid(e.target.value)}
                aria-label="Select a patient for audio note"
                disabled={loadingPatients || uploadAudio.isPending}
              >
                <option value="">{loadingPatients ? "Loading patients…" : "Select patient…"}</option>
                {patients?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                  </option>
                ))}
              </Select>
            </FormRow>

            <FormRow
              label="Audio file"
              hint="Accepted: common audio types (e.g., .wav, .m4a, .mp3). Recommended duration under 5 minutes."
            >
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                aria-label="Upload audio file"
                disabled={uploadAudio.isPending}
              />
              {fileName && (
                <div className="mt-1 text-xs text-gray-600">
                  Selected: <span className="font-medium">{fileName}</span>
                </div>
              )}
            </FormRow>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!file) return;
                  setAudioMsg(null);
                  try {
                    await uploadAudio.mutateAsync({ patientId: audioPid, file });
                    setFile(null);
                    setAudioPid("");
                    setAudioMsg({
                      kind: "success",
                      msg: "Audio uploaded. Go to the patient's notes to Transcribe → Generate SOAP."
                    });
                  } catch {
                    setAudioMsg({ kind: "error", msg: "Failed to upload audio." });
                  }
                }}
                disabled={!audioPid || !file}
                isLoading={uploadAudio.isPending}
              >
                Upload audio
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setFile(null);
                  setAudioPid("");
                  setAudioMsg(null);
                }}
                disabled={uploadAudio.isPending}
              >
                Reset
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
