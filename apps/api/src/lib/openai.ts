import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  // Early crash with clear message instead of silent failures
  throw new Error("Missing OPENAI_API_KEY in environment");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
