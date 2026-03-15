import { NextRequest, NextResponse } from "next/server";
import {
  getActiveSpeechProvider,
  getOpenAIForSpeech,
  getGroqForSpeech,
} from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio") as Blob;
    const language = (formData.get("language") as string) || "en";

    if (!audio) {
      return NextResponse.json({ error: "Audio is required" }, { status: 400 });
    }

    const file = new File([audio], "audio.webm", { type: "audio/webm" });
    const provider = getActiveSpeechProvider();

    if (provider === "groq") {
      // Groq Whisper — free tier, uses whisper-large-v3
      const groq = getGroqForSpeech();
      const transcription = await groq.audio.transcriptions.create({
        file,
        model: "whisper-large-v3",
        language: language !== "auto" ? language : undefined,
      });
      return NextResponse.json({ text: transcription.text, provider: "groq" });
    }

    // Default: OpenAI whisper-1
    const openai = getOpenAIForSpeech();
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: language !== "auto" ? language : undefined,
    });
    return NextResponse.json({ text: transcription.text, provider: "openai" });
  } catch (error) {
    console.error("Speech-to-text error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
