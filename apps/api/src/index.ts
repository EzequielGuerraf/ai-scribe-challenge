import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient, Prisma } from "@prisma/client";
import multer, { StorageEngine } from "multer";
import fs from "fs";
import path from "path";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 4000;

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer disk storage with proper typing
const storage: StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (err: Error | null, dest: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

/** Health check */
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));

/** Get all patients (optional search by query string) */
app.get("/patients", async (req: Request, res: Response) => {
  const q = (req.query.q as string | undefined)?.trim();

  const where: Prisma.PatientWhereInput | undefined = q
    ? {
        OR: [
          { firstName: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { lastName: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { mrn: { contains: q, mode: Prisma.QueryMode.insensitive } }
        ]
      }
    : undefined;

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  res.json({ items: patients, total: patients.length });
});

/** Create a note (TEXT mode) */
app.post("/notes", async (req: Request, res: Response) => {
  const { patientId, sourceText } = req.body as { patientId?: string; sourceText?: string };
  if (!patientId || !sourceText) {
    return res.status(400).json({ error: "patientId and sourceText are required" });
  }

  const note = await prisma.note.create({
    data: { patientId, inputType: "text", status: "ready", sourceText }
  });
  res.status(201).json({ note });
});

/** Get all notes for a specific patient */
app.get("/patients/:id/notes", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const items = await prisma.note.findMany({
    where: { patientId: id },
    orderBy: { createdAt: "desc" }
  });
  res.json({ items, total: items.length });
});

/** Get note detail by ID */
app.get("/notes/:id", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json({ note });
});

/** Simple SOAP generator (heuristic). Replace with LLM later if time allows. */
function toSOAP(base: string) {
  const s = (base || "").trim();
  const subj = s.length ? s.slice(0, 600) : "No subjective report provided.";
  return [
    `S: ${subj}`,
    "O: N/A (no objective vitals provided).",
    "A: Primary assessment based on subjective report; consider differential if symptoms persist.",
    "P: Hydration, rest, OTC analgesics as needed; follow-up if symptoms worsen or persist >48h."
  ].join("\n");
}

/** Generate clinical note (SOAP) from transcript/sourceText */
app.post("/notes/:id/generate", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const n = await prisma.note.findUnique({ where: { id } });
  if (!n) return res.status(404).json({ error: "Note not found" });

  const base = n.transcript || n.sourceText || "";
  const generated = toSOAP(base);

  const note = await prisma.note.update({
    where: { id },
    data: { generatedNote: generated }
  });
  res.json({ note });
});

/** Transcribe a processing audio note (MOCK). Replace with Whisper/OpenAI later. */
app.post("/notes/:id/transcribe", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const transcript =
    "Mock transcript: Patient reports mild headache for 2 days, no fever. Took OTC ibuprofen with partial relief.";

  const note = await prisma.note.update({
    where: { id },
    data: { transcript, status: "ready" }
  });

  return res.json({ note });
});

/** Create a note from AUDIO upload (note starts in processing) */
app.post("/notes/audio", upload.single("file"), async (req: Request, res: Response) => {
  const patientId = (req.body?.patientId as string | undefined) ?? undefined;

  if (!patientId || !req.file) {
    return res.status(400).json({ error: "patientId and file are required" });
    // req.file is available thanks to @types/multer
  }

  const note = await prisma.note.create({
    data: { patientId, inputType: "audio", status: "processing" }
  });

  return res.status(202).json({
    noteId: note.id,
    status: note.status,
    filename: req.file.filename
  });
});

app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
