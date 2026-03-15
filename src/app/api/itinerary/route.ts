import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-provider";
import { localizeObject } from "@/lib/lingo";

export async function POST(req: NextRequest) {
  try {
    const { location, days, interests, budget = "moderate", language = "en" } = await req.json();

    if (!location || !days) {
      return NextResponse.json({ error: "Location and days are required" }, { status: 400 });
    }

    const prompt = `You are an expert travel planner. Create a detailed ${days}-day travel itinerary for "${location}" in English.

User preferences:
- Interests: ${interests?.join(", ") || "general sightseeing"}
- Budget: ${budget}

Return a JSON array of day objects:
[
  {
    "day": 1,
    "theme": "Theme for this day",
    "morning": [
      {
        "time": "8:00 AM",
        "activity": "Activity name",
        "location": "Specific venue/place",
        "description": "What to do and why it's great",
        "duration": "2 hours",
        "tips": "Practical tip"
      }
    ],
    "afternoon": [...],
    "evening": [...]
  }
]

Make it realistic, specific, and culturally accurate. Each time period should have 1-2 activities.
Respond ONLY with the JSON array, no markdown.`;

    const content = await generateText(
      [{ role: "user", content: prompt }],
      { temperature: 0.7, maxTokens: 3000 }
    );

    let itinerary;
    try {
      itinerary = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      itinerary = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    }

    // Use Lingo.dev to localize if target language is not English
    if (language !== "en" && Array.isArray(itinerary) && itinerary.length > 0) {
      try {
        // Collect all localizable text across all days into flat objects
        const themePayload: Record<string, string> = {};
        const descPayload: Record<string, string> = {};
        const tipsPayload: Record<string, string> = {};

        type Activity = {
          time: string;
          activity: string;
          location: string;
          description: string;
          duration: string;
          tips: string;
        };
        type ItineraryDay = {
          day: number;
          theme: string;
          morning: Activity[];
          afternoon: Activity[];
          evening: Activity[];
        };

        itinerary.forEach((day: ItineraryDay, di: number) => {
          themePayload[`theme_${di}`] = day.theme || "";
          const periods: (keyof Pick<ItineraryDay, "morning" | "afternoon" | "evening">)[] = ["morning", "afternoon", "evening"];
          periods.forEach((period) => {
            (day[period] || []).forEach((act: Activity, ai: number) => {
              descPayload[`d_${di}_${period}_${ai}`] = act.description || "";
              tipsPayload[`t_${di}_${period}_${ai}`] = act.tips || "";
            });
          });
        });

        const [localizedThemes, localizedDescs, localizedTips] = await Promise.all([
          localizeObject(themePayload, language, "en"),
          localizeObject(descPayload, language, "en"),
          localizeObject(tipsPayload, language, "en"),
        ]);

        itinerary = itinerary.map((day: ItineraryDay, di: number) => {
          const periods: (keyof Pick<ItineraryDay, "morning" | "afternoon" | "evening">)[] = ["morning", "afternoon", "evening"];
          const localizedDay: ItineraryDay = {
            ...day,
            theme: localizedThemes[`theme_${di}`] || day.theme,
          };
          periods.forEach((period) => {
            localizedDay[period] = (day[period] || []).map((act: Activity, ai: number) => ({
              ...act,
              description: localizedDescs[`d_${di}_${period}_${ai}`] || act.description,
              tips: localizedTips[`t_${di}_${period}_${ai}`] || act.tips,
            }));
          });
          return localizedDay;
        });
      } catch (lingoErr) {
        console.warn("Lingo.dev localization failed, serving English content:", lingoErr);
      }
    }

    return NextResponse.json({ itinerary, location, days });
  } catch (error) {
    console.error("Itinerary error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}
