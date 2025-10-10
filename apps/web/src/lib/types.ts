
export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
  createdAt: string;
};

export type Note = {
  id: string;
  patientId: string;
  inputType: "text" | "audio";
  status: "processing" | "ready" | "failed";
  sourceText?: string | null;
  transcript?: string | null;
  generatedNote?: string | null;
  audioFilename?: string | null;
  createdAt: string;
};
