import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-provider";
import { localizeObject } from "@/lib/lingo";

type Phrase = {
  id: string;
  category: string;
  english: string;
  translated: string;
  pronunciation: string;
};

/**
 * Strip markdown code fences and extract the first JSON array from a string.
 * Returns an empty array if nothing valid is found.
 */
function parsePhrasesFromContent(content: string): Phrase[] {
  // 1. Strip ```json ... ``` or ``` ... ``` wrappers (greedy-safe)
  const stripped = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // 2. Try direct parse first
  try {
    const parsed = JSON.parse(stripped);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Phrase[];
  } catch {
    // fall through
  }

  // 3. Bracket-extract: find the outermost [...] block
  const match = stripped.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as Phrase[];
    } catch {
      // fall through
    }
  }

  return [];
}

function buildPrompt(country: string, category?: string): string {
  return `You are a travel phrase generator. Output ONLY a raw JSON array — no markdown, no explanation, no code fences.

Generate essential travel phrases for a traveler visiting ${country}.
Category: ${category || "greetings, directions, food, emergency"}

Rules:
- "id": short unique string (e.g. "greet-1")
- "category": one of greetings | directions | food | emergency | transportation | shopping | accommodation
- "english": the English phrase
- "translated": the phrase in the LOCAL language of ${country}
- "pronunciation": phonetic guide in English letters

Generate 5-8 phrases per requested category.

Example output format (do not include this comment):
[{"id":"greet-1","category":"greetings","english":"Hello","translated":"Bonjour","pronunciation":"bohn-ZHOOR"}]

Start your response with [ and end with ]. Nothing else.`;
}

export async function POST(req: NextRequest) {
  try {
    const { location, category, language = "en" } = await req.json();
    const country = location || "Japan";

    let phrases: Phrase[] = [];

    // Retry up to 3 times if the response is empty or unparseable
    for (let attempt = 1; attempt <= 3; attempt++) {
      const content = await generateText(
        [{ role: "user", content: buildPrompt(country, category) }],
        { temperature: 0.3, maxTokens: 2500 }
      );

      phrases = parsePhrasesFromContent(content);

      if (phrases.length > 0) break;

      console.warn(
        `[phrases] Attempt ${attempt} returned empty for "${country}". Raw content (first 300 chars):`,
        content.slice(0, 300)
      );
    }

    // Localize pronunciation guides via Lingo.dev when UI language is not English
    if (language !== "en" && phrases.length > 0) {
      try {
        const pronunciationPayload: Record<string, string> = {};
        phrases.forEach((p, i) => {
          pronunciationPayload[`p_${i}`] = p.pronunciation || "";
        });

        const localized = await localizeObject(pronunciationPayload, language, "en");

        phrases = phrases.map((p, i) => ({
          ...p,
          pronunciation: localized[`p_${i}`] || p.pronunciation,
        }));
      } catch (lingoErr) {
        console.warn("[phrases] Lingo.dev localization failed:", lingoErr);
      }
    }

    return NextResponse.json({ phrases });
  } catch (error) {
    console.error("[phrases] Unhandled error:", error);
    return NextResponse.json({ error: "Failed to generate phrases" }, { status: 500 });
  }
}
