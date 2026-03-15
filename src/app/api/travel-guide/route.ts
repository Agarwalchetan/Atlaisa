import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-provider";
import { localizeObject } from "@/lib/lingo";

export async function POST(req: NextRequest) {
  try {
    const { location, language = "en" } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    // Always generate guide in English first, then localize via Lingo.dev
    const prompt = `You are an expert travel guide AI. Generate a comprehensive travel guide for "${location}" in English.

Return a JSON object with this exact structure:
{
  "overview": "2-3 sentence engaging overview of the destination",
  "bestTimeToVisit": "When to visit and why",
  "mustVisitPlaces": [
    {
      "name": "Place name",
      "description": "What makes it special",
      "category": "attraction/temple/museum/park/landmark",
      "rating": 4.8
    }
  ],
  "famousFood": [
    {
      "name": "Food name",
      "description": "What it is and why it's famous",
      "where": "Where to try it",
      "mustTry": true
    }
  ],
  "culturalEtiquette": [
    {
      "category": "Greeting/Dining/Dress/Behavior",
      "tip": "The specific tip",
      "severity": "important/good-to-know/avoid"
    }
  ],
  "transportationTips": ["tip1", "tip2", "tip3"],
  "hiddenGems": ["gem1", "gem2", "gem3"],
  "emergencyNumbers": [
    { "service": "Police", "number": "110" },
    { "service": "Ambulance", "number": "119" }
  ]
}

Provide at least 5 must-visit places, 4 foods, 5 cultural tips, 3 transportation tips, 3 hidden gems.
Respond ONLY with the JSON object, no markdown.`;

    const content = await generateText(
      [{ role: "user", content: prompt }],
      { temperature: 0.7, maxTokens: 2000 }
    );
    
    let guide;
    try {
      guide = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      guide = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    // Use Lingo.dev to localize if target language is not English
    if (language !== "en" && guide) {
      try {
        // Localize flat text fields
        const textPayload: Record<string, string> = {
          overview: guide.overview || "",
          bestTimeToVisit: guide.bestTimeToVisit || "",
        };

        const localizedText = await localizeObject(textPayload, language, "en");
        guide.overview = localizedText.overview;
        guide.bestTimeToVisit = localizedText.bestTimeToVisit;

        // Localize arrays of strings
        if (guide.transportationTips?.length) {
          const tipsObj: Record<string, string> = {};
          guide.transportationTips.forEach((t: string, i: number) => { tipsObj[`tip_${i}`] = t; });
          const localizedTips = await localizeObject(tipsObj, language, "en");
          guide.transportationTips = Object.values(localizedTips);
        }

        if (guide.hiddenGems?.length) {
          const gemsObj: Record<string, string> = {};
          guide.hiddenGems.forEach((g: string, i: number) => { gemsObj[`gem_${i}`] = g; });
          const localizedGems = await localizeObject(gemsObj, language, "en");
          guide.hiddenGems = Object.values(localizedGems);
        }

        // Localize cultural etiquette tips
        if (guide.culturalEtiquette?.length) {
          const tipPayload: Record<string, string> = {};
          guide.culturalEtiquette.forEach((t: { tip: string }, i: number) => {
            tipPayload[`tip_${i}`] = t.tip;
          });
          const localizedTips = await localizeObject(tipPayload, language, "en");
          guide.culturalEtiquette = guide.culturalEtiquette.map(
            (t: { tip: string; category: string; severity: string }, i: number) => ({
              ...t,
              tip: localizedTips[`tip_${i}`] || t.tip,
            })
          );
        }

        // Localize place descriptions
        if (guide.mustVisitPlaces?.length) {
          const placePayload: Record<string, string> = {};
          guide.mustVisitPlaces.forEach((p: { description: string }, i: number) => {
            placePayload[`place_${i}`] = p.description;
          });
          const localizedPlaces = await localizeObject(placePayload, language, "en");
          guide.mustVisitPlaces = guide.mustVisitPlaces.map(
            (p: { name: string; description: string; category: string; rating: number }, i: number) => ({
              ...p,
              description: localizedPlaces[`place_${i}`] || p.description,
            })
          );
        }

        // Localize food descriptions
        if (guide.famousFood?.length) {
          const foodPayload: Record<string, string> = {};
          guide.famousFood.forEach((f: { description: string }, i: number) => {
            foodPayload[`food_${i}`] = f.description;
          });
          const localizedFood = await localizeObject(foodPayload, language, "en");
          guide.famousFood = guide.famousFood.map(
            (f: { name: string; description: string; where: string; mustTry: boolean }, i: number) => ({
              ...f,
              description: localizedFood[`food_${i}`] || f.description,
            })
          );
        }
      } catch (lingoErr) {
        console.warn("Lingo.dev localization failed, serving English content:", lingoErr);
      }
    }

    return NextResponse.json({ guide, location });
  } catch (error) {
    console.error("Travel guide error:", error);
    return NextResponse.json(
      { error: "Failed to generate travel guide" },
      { status: 500 }
    );
  }
}
