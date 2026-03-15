/**
 * Unified AI provider abstraction.
 *
 * Provider selection (first "true" wins, priority: OpenAI → Gemini → Groq):
 *   USE_OPENAI=true   → OpenAI  (model: OPENAI_MODEL  || "gpt-4o-mini")
 *   USE_GEMINI=true   → Gemini  (model: GEMINI_MODEL  || "gemini-2.0-flash")
 *   USE_GROQ=true     → Groq    (model: GROQ_MODEL    || "llama-3.3-70b-versatile")
 *
 * If none is set to "true", OpenAI is used as the default.
 *
 * Speech (STT only — TTS always uses OpenAI):
 *   SPEECH_PROVIDER=openai  → whisper-1 via OpenAI
 *   SPEECH_PROVIDER=groq    → whisper-large-v3 via Groq (free tier)
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GenerateOptions = {
  temperature?: number;
  maxTokens?: number;
};

export type AIProvider = "openai" | "gemini" | "groq";
export type SpeechProvider = "openai" | "groq";

// ── Provider resolution ────────────────────────────────────────────────────────

function resolveTextProvider(): AIProvider {
  if (process.env.USE_OPENAI === "true") return "openai";
  if (process.env.USE_GEMINI === "true") return "gemini";
  if (process.env.USE_GROQ === "true") return "groq";
  // Default: OpenAI (backward-compatible)
  return "openai";
}

function resolveSpeechProvider(): SpeechProvider {
  if (process.env.SPEECH_PROVIDER === "groq") return "groq";
  return "openai";
}

export function getActiveProvider(): AIProvider {
  return resolveTextProvider();
}

export function getActiveSpeechProvider(): SpeechProvider {
  return resolveSpeechProvider();
}

// ── Lazy SDK clients (instantiated on first use) ───────────────────────────────

let _openai: OpenAI | null = null;
let _groq: Groq | null = null;
let _gemini: GoogleGenerativeAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _openai;
}

function getGroqClient(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

function getGeminiClient(): GoogleGenerativeAI {
  if (!_gemini) _gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  return _gemini;
}

// ── Core text generation ───────────────────────────────────────────────────────

/**
 * Generate text from a messages array using whichever provider is active.
 * Returns the raw string content (no JSON parsing — callers handle that).
 */
export async function generateText(
  messages: ChatMessage[],
  opts: GenerateOptions = {}
): Promise<string> {
  const provider = resolveTextProvider();
  const { temperature = 0.7, maxTokens = 2000 } = opts;

  switch (provider) {
    case "openai":
      return generateWithOpenAI(messages, temperature, maxTokens);
    case "gemini":
      return generateWithGemini(messages, temperature, maxTokens);
    case "groq":
      return generateWithGroq(messages, temperature, maxTokens);
  }
}

// ── OpenAI ─────────────────────────────────────────────────────────────────────

async function generateWithOpenAI(
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const response = await getOpenAIClient().chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0].message.content || "";
}

// ── Gemini ─────────────────────────────────────────────────────────────────────

async function generateWithGemini(
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const client = getGeminiClient();
  const model = client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  });

  // Gemini doesn't have a native "system" role in the contents array.
  // Prepend any system messages as a preamble to the first user message.
  const systemParts = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");

  const conversationMessages = messages.filter((m) => m.role !== "system");

  // Build Gemini contents array
  const contents = conversationMessages.map((m, i) => {
    let text = m.content;
    // Prepend system preamble to the very first user message
    if (i === 0 && systemParts && m.role === "user") {
      text = `${systemParts}\n\n${text}`;
    }
    return {
      role: m.role === "assistant" ? "model" : ("user" as "user" | "model"),
      parts: [{ text }],
    };
  });

  // If there were only system messages and no user messages, create a synthetic user turn
  if (contents.length === 0 && systemParts) {
    contents.push({ role: "user" as const, parts: [{ text: systemParts }] });
  }

  const result = await model.generateContent({ contents });
  return result.response.text();
}

// ── Groq ───────────────────────────────────────────────────────────────────────

async function generateWithGroq(
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  // Groq SDK is OpenAI-compatible — identical call shape
  const response = await getGroqClient().chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  });
  return response.choices[0].message.content || "";
}

// ── Speech (STT) client exports ────────────────────────────────────────────────
// The transcribe route imports these directly to avoid duplicating client init logic.

export function getOpenAIForSpeech(): OpenAI {
  return getOpenAIClient();
}

export function getGroqForSpeech(): Groq {
  return getGroqClient();
}
