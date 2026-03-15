import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-provider";
import { localizeObject } from "@/lib/lingo";

export async function POST(req: NextRequest) {
  try {
    const { location, language = "en" } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const prompt = `You are a culinary travel expert. Generate a Food Explorer guide for a tourist visiting "${location}".

Return a JSON object with this exact structure:
{
  "location": "City/Country name",
  "foods": [
    {
      "id": "food-1",
      "name": "Pizza Napoletana",
      "localName": "Pizza Napoletana",
      "description": "2-3 sentences about what it is, its history, and why it's iconic",
      "flavourProfile": "Savory, tangy, slightly charred",
      "whereToTry": "Specific restaurant or neighborhood name",
      "orderingPhrase": {
        "english": "I would like a Margherita pizza, please.",
        "local": "Vorrei una pizza margherita, per favore.",
        "pronunciation": "Vor-REI oo-na PEET-za mar-geh-REE-ta per fa-VO-re"
      },
      "mustTry": true,
      "priceRange": "budget/moderate/splurge",
      "dietaryTags": ["vegetarian"]
    }
  ],
  "foodTips": [
    "Lunch is the main meal in this country",
    "..."
  ],
  "bestFoodAreas": ["Neighborhood 1", "Neighborhood 2", "Street/Market name"]
}

Generate 6-8 iconic foods for this destination. Each food should be truly representative of the local cuisine.
Include a mix of: street food, sit-down dishes, desserts/snacks.
dietaryTags can include: vegetarian, vegan, gluten-free, halal, seafood, meat, spicy, sweet.
Respond ONLY with the JSON object, no markdown.`;

    const content = await generateText(
      [{ role: "user", content: prompt }],
      { temperature: 0.7, maxTokens: 2500 }
    );

    let explorer;
    try {
      explorer = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      explorer = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    // Localize descriptions and tips via Lingo.dev for non-English UI
    if (language !== "en" && explorer) {
      try {
        // Localize food descriptions
        if (explorer.foods?.length) {
          const descPayload: Record<string, string> = {};
          explorer.foods.forEach(
            (f: { description: string; flavourProfile: string }, i: number) => {
              descPayload[`desc_${i}`] = f.description;
              descPayload[`flavour_${i}`] = f.flavourProfile;
            }
          );
          const localizedDescs = await localizeObject(descPayload, language, "en");
          explorer.foods = explorer.foods.map(
            (f: { description: string; flavourProfile: string }, i: number) => ({
              ...f,
              description: localizedDescs[`desc_${i}`] || f.description,
              flavourProfile: localizedDescs[`flavour_${i}`] || f.flavourProfile,
            })
          );
        }

        // Localize food tips
        if (explorer.foodTips?.length) {
          const tipsPayload: Record<string, string> = {};
          explorer.foodTips.forEach((t: string, i: number) => { tipsPayload[`tip_${i}`] = t; });
          const localizedTips = await localizeObject(tipsPayload, language, "en");
          explorer.foodTips = Object.values(localizedTips);
        }
      } catch (lingoErr) {
        console.warn("[food-explorer] Lingo.dev localization failed:", lingoErr);
      }
    }

    return NextResponse.json({ explorer, location });
  } catch (error) {
    console.error("[food-explorer] Error:", error);
    return NextResponse.json({ error: "Failed to generate food explorer" }, { status: 500 });
  }
}
