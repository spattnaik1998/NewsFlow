import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import { getSummary } from "@/lib/ai/summarizer";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const rl = checkRateLimit(`summarize:${ip}`, RATE_LIMITS.SUMMARIZE);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
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

    const summary = await getSummary(article);
    return NextResponse.json(summary, {
      headers: { "X-RateLimit-Remaining": String(rl.remaining) },
    });
  } catch (error) {
    console.error("[/api/summarize]", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
