"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNoteDetail, useGenerate, useTranscribe } from "@/hooks/useNotes";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/statusBadge";
import { Clipboard, ClipboardCheck, ArrowLeft, FileText, FileAudio2, Stethoscope, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

type TabKey = "source" | "transcript" | "soap";

export default function NoteDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: note, isLoading, isError, refetch } = useNoteDetail(id);
  const transcribe = useTranscribe();
  const generate = useGenerate();

  // Build tab model depending on available fields
  const tabs = useMemo(() => {
    const t: { key: TabKey; label: string; icon: ReactNode; present: boolean }[] = [
      { key: "source", label: "Source", icon: <FileText size={14} />, present: !!note?.sourceText },
      { key: "transcript", label: "Transcript", icon: <FileAudio2 size={14} />, present: !!note?.transcript },
      { key: "soap", label: "SOAP", icon: <Stethoscope size={14} />, present: !!note?.generatedNote }
    ];
    return t.filter(x => x.present);
  }, [note]);

  const [active, setActive] = useState<TabKey | null>(null);

  useEffect(() => {
    // Choose first available tab as default
    if (!active && tabs.length) setActive(tabs[0].key);
  }, [tabs, active]);

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
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2" size={14} /> Retry
        </Button>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="p-6 space-y-3">
        <div className="text-sm text-gray-600">Note not found.</div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2" size={14} /> Go back
        </Button>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Note Detail</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-500">ID:</span> <span className="font-mono">{note.id}</span>
            <span className="text-gray-400">•</span>
            <span>{new Date(note.createdAt).toLocaleString()}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">Type:</span> <span className="font-medium">{note.inputType}</span>
            <span className="text-gray-400">•</span>
            <StatusBadge status={note.status} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2" size={14} /> Back
          </Button>
          {/* Optional actions from detail */}
          <Button
            variant="outline"
            onClick={() => transcribe.mutate(note.id, { onSuccess: () => refetch() })}
            isLoading={transcribe.isPending}
          >
            <FileAudio2 className="mr-2" size={14} />
            {transcribe.isPending ? "Transcribing…" : "Transcribe"}
          </Button>
          <Button
            variant="primary"
            onClick={() => generate.mutate(note.id, { onSuccess: () => refetch() })}
            isLoading={generate.isPending}
          >
            <Stethoscope className="mr-2" size={14} />
            {generate.isPending ? "Generating…" : "Generate SOAP"}
          </Button>
        </div>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader title="Overview" subtitle="Key metadata for this clinical note" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <KeyValue label="Patient ID" value={note.patientId} mono />
          <KeyValue label="Status" value={<StatusBadge status={note.status} />} />
          <KeyValue label="Created" value={new Date(note.createdAt).toLocaleString()} />
          <KeyValue label="Input Type" value={note.inputType} />
          {note.audioFilename && <KeyValue label="Audio file" value={note.audioFilename} mono />}
        </CardBody>
      </Card>

      {/* Content Tabs */}
      {tabs.length ? (
        <Card>
          <CardHeader
            title="Content"
            subtitle="Switch between raw source, transcript, and generated SOAP"
          />
          <CardBody>
            <Tabs tabs={tabs} active={active} onChange={setActive} />
            <div className="mt-4">
              {active === "source" && !!note.sourceText && (
                <CopyableBlock label="Source Text" text={note.sourceText} />
              )}
              {active === "transcript" && !!note.transcript && (
                <CopyableBlock label="Transcript" text={note.transcript} />
              )}
              {active === "soap" && !!note.generatedNote && (
                <CopyableBlock label="Generated SOAP" text={note.generatedNote} />
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Content" />
          <CardBody>
            <p className="text-sm text-gray-600">
              No content yet. Use <span className="font-medium">Transcribe</span> and{" "}
              <span className="font-medium">Generate SOAP</span> to populate this note.
            </p>
          </CardBody>
        </Card>
      )}
    </main>
  );
}

/** Key/value row used in Overview. */
function KeyValue({
  label,
  value,
  mono
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={mono ? "font-mono text-sm text-gray-800" : "text-sm text-gray-800"}>{value}</div>
    </div>
  );
}

/** Simple tabs control without extra deps. */
function Tabs({
  tabs,
  active,
  onChange
}: {
  tabs: { key: "source" | "transcript" | "soap"; label: string; icon: ReactNode }[];
  active: "source" | "transcript" | "soap" | null;
  onChange: (k: "source" | "transcript" | "soap") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={
            "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm " +
            (active === t.key
              ? "border-emerald-600 bg-emerald-50 text-emerald-700"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50")
          }
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Text block with copy-to-clipboard button and better readability. */
function CopyableBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            } catch {
              // no-op
            }
          }}
        >
          {copied ? <ClipboardCheck size={14} className="mr-2" /> : <Clipboard size={14} className="mr-2" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="whitespace-pre-wrap rounded-md border bg-gray-50 p-4 font-mono text-sm leading-6 text-gray-800">
        {text}
      </pre>
    </div>
  );
}
