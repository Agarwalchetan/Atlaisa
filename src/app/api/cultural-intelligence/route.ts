import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-provider";
import { localizeObject } from "@/lib/lingo";

export async function POST(req: NextRequest) {
  try {
    const { location, language = "en" } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    // Always generate in English, then localize via Lingo.dev
    const prompt = `You are a cultural intelligence expert. Generate cultural etiquette and intelligence for "${location}" in English.

Return a JSON object:
{
  "greetingCustoms": ["Custom 1", "Custom 2", "Custom 3"],
  "diningEtiquette": ["Tip 1", "Tip 2", "Tip 3"],
  "socialNorms": ["Norm 1", "Norm 2", "Norm 3"],
  "thingsToAvoid": ["Avoid 1", "Avoid 2", "Avoid 3"],
  "dresscode": "General dress code guidance",
  "tipping": "Tipping customs and expectations",
  "religiousConsiderations": ["Consideration 1", "Consideration 2"]
}

Be specific, accurate, and culturally sensitive. Provide at least 3-4 items per category.
Respond ONLY with the JSON object.`;

    const content = await generateText(
      [{ role: "user", content: prompt }],
      { temperature: 0.6, maxTokens: 1200 }
    );
    let intelligence;
    try {
      intelligence = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      intelligence = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    // Use Lingo.dev to localize if target language is not English
    if (language !== "en" && intelligence) {
      try {
        // Build a flat key-value object for all localizable strings
        const payload: Record<string, string> = {
          dresscode: intelligence.dresscode || "",
          tipping: intelligence.tipping || "",
        };

        const arrayFields = [
          "greetingCustoms",
          "diningEtiquette",
          "socialNorms",
          "thingsToAvoid",
          "religiousConsiderations",
        ] as const;

        arrayFields.forEach((field) => {
          (intelligence[field] || []).forEach((item: string, i: number) => {
            payload[`${field}_${i}`] = item;
          });
        });

        const localized = await localizeObject(payload, language, "en");

        intelligence.dresscode = localized.dresscode || intelligence.dresscode;
        intelligence.tipping = localized.tipping || intelligence.tipping;

        arrayFields.forEach((field) => {
          if (Array.isArray(intelligence[field])) {
            intelligence[field] = intelligence[field].map(
              (_: string, i: number) => localized[`${field}_${i}`] || intelligence[field][i]
            );
          }
        });
      } catch (lingoErr) {
        console.warn("Lingo.dev localization failed, serving English content:", lingoErr);
      }
    }

    return NextResponse.json({ intelligence, location });
  } catch (error) {
    console.error("Cultural intelligence error:", error);
    return NextResponse.json({ error: "Failed to generate cultural intelligence" }, { status: 500 });
  }
}
