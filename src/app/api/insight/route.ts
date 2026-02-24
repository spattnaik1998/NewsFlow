import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import { getInsight } from "@/lib/ai/insight";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  // Shares the summarize budget (10/min)
  const rl = checkRateLimit(`summarize:${ip}`, RATE_LIMITS.SUMMARIZE);
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
    const body = await request.json();
    const { articleId } = body;

    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    const feed = await fetchAllSources();
    const article = feed.articles.find((a) => a.id === articleId);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const insight = await getInsight(article);
    return NextResponse.json(insight, {
      headers: { "X-RateLimit-Remaining": String(rl.remaining) },
    });
  } catch (error) {
    console.error("[/api/insight]", error);
    return NextResponse.json({ error: "Failed to generate insight" }, { status: 500 });
  }
}
