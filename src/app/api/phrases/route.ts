import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-provider";
import { localizeObject } from "@/lib/lingo";

export async function POST(req: NextRequest) {
  try {
    const { location, category, language = "en" } = await req.json();

    const country = location || "Japan";

    // Always ask OpenAI for English phrases + local-language translation.
    // Pronunciation guide is generated in English; Lingo.dev will localize it.
    const prompt = `Generate essential travel phrases for a traveler visiting ${country}.
Category: ${category || "all categories"}
Translate each phrase to the LOCAL language of ${country} and provide a phonetic pronunciation guide written in English.

Return a JSON array:
[
  {
    "id": "unique-id",
    "category": "greetings/directions/food/emergency/transportation/shopping/accommodation",
    "english": "English phrase",
    "translated": "Translated text in local language of ${country}",
    "pronunciation": "Phonetic pronunciation guide in English"
  }
]

Generate 5-8 phrases per category. If no category specified, generate phrases for: greetings, directions, food, emergency.
Respond ONLY with the JSON array.`;

    const content = await generateText(
      [{ role: "user", content: prompt }],
      { temperature: 0.4, maxTokens: 2000 }
    );

    // Strip markdown code fences (```json ... ``` or ``` ... ```) that some
    // models wrap around JSON output, then fall back to a bracket-extract.
    let phrases: unknown[] = [];
    const stripped = content.replace(/```(?:json)?\s*([\s\S]*?)```/i, "$1").trim();
    try {
      const parsed = JSON.parse(stripped);
      phrases = Array.isArray(parsed) ? parsed : [];
    } catch {
      const jsonMatch = stripped.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          phrases = Array.isArray(parsed) ? parsed : [];
        } catch {
          phrases = [];
        }
      }
    }

    type Phrase = {
      id: string;
      category: string;
      english: string;
      translated: string;
      pronunciation: string;
    };

    let typedPhrases = phrases as Phrase[];

    // Use Lingo.dev to localize UI-facing text (pronunciation guides) if not English
    if (language !== "en" && typedPhrases.length > 0) {
      try {
        // Localize pronunciation guides into the user's chosen UI language
        const pronunciationPayload: Record<string, string> = {};
        typedPhrases.forEach((p, i) => {
          pronunciationPayload[`p_${i}`] = p.pronunciation || "";
        });

        const localizedPronunciations = await localizeObject(pronunciationPayload, language, "en");

        typedPhrases = typedPhrases.map((p, i) => ({
          ...p,
          pronunciation: localizedPronunciations[`p_${i}`] || p.pronunciation,
        }));
      } catch (lingoErr) {
        console.warn("Lingo.dev localization failed, serving English content:", lingoErr);
      }
    }

    return NextResponse.json({ phrases: typedPhrases });
  } catch (error) {
    console.error("Phrases error:", error);
    return NextResponse.json({ error: "Failed to generate phrases" }, { status: 500 });
  }
}
