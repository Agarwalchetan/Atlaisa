import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-provider";
import { localizeObject } from "@/lib/lingo";

export async function POST(req: NextRequest) {
  try {
    const { location, language = "en" } = await req.json();

    if (!location) {
      return NextResponse.json({ error: "Location is required" }, { status: 400 });
    }

    const prompt = `You are a travel safety expert. Generate a concise Travel Survival Card for a tourist visiting "${location}".

Return a JSON object with this exact structure:
{
  "country": "Country name",
  "currency": "Currency name and symbol",
  "emergencyNumbers": [
    { "service": "Police", "number": "110" },
    { "service": "Ambulance", "number": "119" },
    { "service": "Fire", "number": "119" },
    { "service": "Tourist Helpline", "number": "..." }
  ],
  "usefulPhrases": [
    { "english": "Help!", "local": "助けて！", "pronunciation": "Tasukete!" },
    { "english": "I need a doctor", "local": "医者が必要です", "pronunciation": "Isha ga hitsuyou desu" },
    { "english": "Call the police", "local": "...", "pronunciation": "..." },
    { "english": "Where is the hospital?", "local": "...", "pronunciation": "..." },
    { "english": "I am lost", "local": "...", "pronunciation": "..." },
    { "english": "I don't understand", "local": "...", "pronunciation": "..." }
  ],
  "localRules": [
    { "rule": "No tipping expected", "category": "etiquette" },
    { "rule": "Quiet on public transport", "category": "transport" },
    { "rule": "Remove shoes before entering homes/temples", "category": "culture" }
  ],
  "paymentInfo": {
    "preferredMethod": "Cash / Card / Both",
    "localCurrencyAdvised": true,
    "notes": "Brief note about ATMs, credit card acceptance, etc."
  },
  "safetyTips": [
    "Keep a copy of your passport",
    "Register with your embassy",
    "..."
  ],
  "visaInfo": "Brief visa-on-arrival / visa-required note for most Western tourists",
  "voltageAndPlugs": "e.g. 110V, Type A/B plugs",
  "timeZone": "e.g. JST (UTC+9)",
  "drinkingWater": "Safe to drink tap water / Buy bottled water"
}

Provide real, accurate emergency numbers for this country. Include 4 emergency contacts, 6 useful phrases, 4-5 local rules, and 3 safety tips.
Respond ONLY with the JSON object, no markdown.`;

    const content = await generateText(
      [{ role: "user", content: prompt }],
      { temperature: 0.3, maxTokens: 1500 }
    );

    let card;
    try {
      card = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      card = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    // Localize UI-facing text via Lingo.dev when non-English
    if (language !== "en" && card) {
      try {
        const textPayload: Record<string, string> = {
          visaInfo: card.visaInfo || "",
          drinkingWater: card.drinkingWater || "",
          voltageAndPlugs: card.voltageAndPlugs || "",
          paymentNotes: card.paymentInfo?.notes || "",
        };

        const localizedText = await localizeObject(textPayload, language, "en");
        card.visaInfo = localizedText.visaInfo;
        card.drinkingWater = localizedText.drinkingWater;
        card.voltageAndPlugs = localizedText.voltageAndPlugs;
        if (card.paymentInfo) card.paymentInfo.notes = localizedText.paymentNotes;

        if (card.safetyTips?.length) {
          const tipsPayload: Record<string, string> = {};
          card.safetyTips.forEach((t: string, i: number) => { tipsPayload[`tip_${i}`] = t; });
          const localizedTips = await localizeObject(tipsPayload, language, "en");
          card.safetyTips = Object.values(localizedTips);
        }

        if (card.localRules?.length) {
          const rulesPayload: Record<string, string> = {};
          card.localRules.forEach((r: { rule: string }, i: number) => { rulesPayload[`rule_${i}`] = r.rule; });
          const localizedRules = await localizeObject(rulesPayload, language, "en");
          card.localRules = card.localRules.map(
            (r: { rule: string; category: string }, i: number) => ({
              ...r,
              rule: localizedRules[`rule_${i}`] || r.rule,
            })
          );
        }
      } catch (lingoErr) {
        console.warn("[survival-card] Lingo.dev localization failed:", lingoErr);
      }
    }

    return NextResponse.json({ card, location });
  } catch (error) {
    console.error("[survival-card] Error:", error);
    return NextResponse.json({ error: "Failed to generate survival card" }, { status: 500 });
  }
}
