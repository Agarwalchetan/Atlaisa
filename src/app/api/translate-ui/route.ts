import { NextRequest, NextResponse } from "next/server";
import { localizeObject } from "@/lib/lingo";

/**
 * POST /api/translate-ui
 * Body: { strings: Record<string, string>, language: string }
 * Returns: { strings: Record<string, string> }
 *
 * Used by the useTranslations() hook to localize static UI strings
 * via Lingo.dev when the user switches language.
 */
export async function POST(req: NextRequest) {
  try {
    const { strings, language } = await req.json();

    if (!strings || typeof strings !== "object") {
      return NextResponse.json({ error: "Invalid strings payload" }, { status: 400 });
    }

    if (!language || language === "en") {
      return NextResponse.json({ strings });
    }

    const localized = await localizeObject(strings as Record<string, string>, language, "en");
    return NextResponse.json({ strings: localized });
  } catch (error) {
    console.error("translate-ui error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
