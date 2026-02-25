import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import { generateBriefing, clearBriefingCache } from "@/lib/ai/briefing";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const rl = checkRateLimit(`briefing:${ip}`, RATE_LIMITS.CATEGORIZE); // 5/min
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    const feed = await fetchAllSources();
    const briefing = await generateBriefing(feed.articles);
    return NextResponse.json(briefing);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate briefing";
    console.error("[/api/briefing]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  clearBriefingCache();
  return NextResponse.json({ ok: true });
}
