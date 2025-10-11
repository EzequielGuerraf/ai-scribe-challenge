import fs from "fs";
import path from "path";
import { openai } from "../lib/openai";

/** Generate SOAP note using OpenAI (text -> text). */
export async function generateSOAPWithAI(base: string): Promise<string> {
  const model = process.env.GENERATION_MODEL || "gpt-4o-mini";
  const max = Number(process.env.SOAP_MAX_INPUT_CHARS || 6000);

  const trimmed = (base || "").slice(0, max);

  const system =
    "You are a clinical documentation assistant. Produce a concise, clinically sound SOAP note. " +
    "Use English unless the input is clearly Spanish (then respond in Spanish). " +
    "Return exactly four sections prefixed by 'S:', 'O:', 'A:', 'P:' on separate lines. " +
    "Keep it succinct, avoid hallucinations, do not invent vitals, and do not include disclaimers.";

  const user =
    "Source transcript or free-text note:\n" +
    "------------------------------\n" +
    trimmed +
    "\n------------------------------\n" +
    "Generate a SOAP note. If data is missing, write 'N/A' explicitly in that section.";

  const resp = await openai.chat.completions.create({
    model,
    temperature: 0.3,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  const out = resp.choices?.[0]?.message?.content?.trim() || "";
  if (!out) throw new Error("Empty generation response");
  return out;
}

const TRANSCRIBE_MODEL = process.env.TRANSCRIBE_MODEL || "whisper-1";

/** Transcribe an audio file using OpenAI Whisper. */
export async function transcribeAudio(filePath: string): Promise<string> {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`Audio file not found: ${abs}`);
  }

  const file = fs.createReadStream(abs);

  // Whisper-style API
  const resp = await openai.audio.transcriptions.create({
    file,
    model: TRANSCRIBE_MODEL,
    // Can add language: "es" | "en" if you know it; Whisper usually auto-detects.
    // language: "en"
  });

  // SDK returns { text: string }
  const text = (resp as any).text ?? "";
  if (!text) throw new Error("Empty transcription response");
  return String(text);
}
