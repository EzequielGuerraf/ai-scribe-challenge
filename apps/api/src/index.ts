import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient, Prisma } from "@prisma/client";
import multer, { StorageEngine } from "multer";
import fs from "fs";
import path from "path";
import { transcribeAudio, generateSOAPWithAI } from "./services/aiService";

const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.PORT) || 4000;

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer disk storage with typing
const storage: StorageEngine = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  }
});

// Optional: basic hardening (size + mime)
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (_req, file, cb) => {
    if (/^audio\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only audio/* files are accepted"));
  }
});

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

/** Heuristic SOAP fallback (used if AI key is missing or AI call fails) */
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

/** Generate clinical note (SOAP) from transcript/sourceText using AI (fallback to heuristic) */
app.post("/notes/:id/generate", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const n = await prisma.note.findUnique({ where: { id } });
  if (!n) return res.status(404).json({ error: "Note not found" });

  const base = (n.transcript || n.sourceText || "").trim();
  if (!base) {
    return res.status(400).json({ error: "No transcript or sourceText available to generate SOAP" });
  }

  try {
    let generated: string;
    if (process.env.OPENAI_API_KEY) {
      generated = await generateSOAPWithAI(base);
    } else {
      generated = toSOAP(base);
    }

    const note = await prisma.note.update({
      where: { id },
      data: { generatedNote: generated }
    });

    return res.json({ note });
  } catch (err: any) {
    // Fallback to heuristic if AI generation fails (quota, timeout, etc.)
    const generated = toSOAP(base);
    const note = await prisma.note.update({
      where: { id },
      data: { generatedNote: generated }
    });

    return res.status(200).json({
      note,
      warning: "AI generation failed; returned heuristic SOAP instead.",
      details: err?.message || String(err)
    });
  }
});

/** Transcribe an audio note using OpenAI Whisper (real) */
app.post("/notes/:id/transcribe", async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const n = await prisma.note.findUnique({ where: { id } });
  if (!n) return res.status(404).json({ error: "Note not found" });

  if (n.inputType !== "audio") {
    return res.status(400).json({ error: "Transcription only allowed for audio notes" });
  }
  if (!n.audioFilename) {
    return res.status(400).json({ error: "No audio filename stored for this note" });
  }

  const filePath = path.join(uploadDir, n.audioFilename);

  try {
    // reflect work in progress
    await prisma.note.update({ where: { id }, data: { status: "processing" } });

    const transcript = await transcribeAudio(filePath);

    const updated = await prisma.note.update({
      where: { id },
      data: { transcript, status: "ready" }
    });

    return res.json({ note: updated });
  } catch (err: any) {
    console.error("🔴 Whisper error:", err);
    await prisma.note.update({ where: { id }, data: { status: "failed" } });
    return res.status(500).json({
      error: "Transcription failed",
      details: err?.message || String(err)
    });
  }
});

/** Create a note from AUDIO upload: start in processing and keep filename */
app.post("/notes/audio", upload.single("file"), async (req: Request, res: Response) => {
  const patientId = (req.body?.patientId as string | undefined) ?? undefined;

  if (!patientId || !req.file) {
    return res.status(400).json({ error: "patientId and file are required" });
  }

  const note = await prisma.note.create({
    data: {
      patientId,
      inputType: "audio",
      status: "processing",
      audioFilename: req.file.filename // <-- critical to transcribe later
    }
  });

  return res.status(202).json({
    noteId: note.id,
    status: note.status,
    filename: req.file.filename
  });
});

/** Minimal JSON error handler so every error becomes JSON */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const code = typeof err?.status === "number" ? err.status : 500;
  res.status(code).json({ error: err?.message || "Internal Server Error" });
});

app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
