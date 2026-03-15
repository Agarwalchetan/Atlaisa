import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
  try {
    const { messages, location, language = "en" } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const locationContext = location
      ? `The user is currently focused on or planning a trip to: ${location}.`
      : "The user has not specified a specific destination yet.";

    const languageContext =
      language !== "en"
        ? `Respond in ${language} language when appropriate, but always provide English alongside if the content includes local phrases or translations.`
        : "";

    const systemPrompt = `You are Atlasia, a smart and friendly AI travel assistant. You help travelers with practical advice, local insights, navigation tips, cultural guidance, food recommendations, safety information, and anything else travel-related.

${locationContext}
${languageContext}

Guidelines:
- Be concise but informative (2-4 paragraphs max unless a list is clearly better)
- Use specific, actionable advice — not generic platitudes
- When mentioning prices, give realistic ranges in local currency and USD
- When recommending places, give specific names (not "a nice cafe" but "Cafe de Flore")
- For safety questions, be honest and practical
- If asked about transport, include cost, duration, and how to buy tickets
- Always be warm and encouraging — travel should be exciting!
- Format responses with markdown: use **bold** for place names, \`code\` for important phrases, and bullet lists for tips

You have expertise in: local cuisine, public transport, cultural norms, hidden gems, budgeting, safety, language tips, and itinerary planning.`;

    const aiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const reply = await generateText(aiMessages, { temperature: 0.7, maxTokens: 800 });

    return NextResponse.json({ reply, role: "assistant" });
  } catch (error) {
    console.error("[chat] Error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
