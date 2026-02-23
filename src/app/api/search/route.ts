import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import { searchSerper } from "@/lib/fetchers/serper";
import { searchTavily } from "@/lib/fetchers/tavily";
import type { SearchResponse } from "@/lib/types";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rl = checkRateLimit(`search:${ip}`, RATE_LIMITS.SEARCH);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many searches. Slow down." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  const deep = searchParams.get("deep") === "true";

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  // Sanitize query — strip HTML-like chars
  const safeQuery = query.replace(/[<>"'&]/g, "").slice(0, 200);

  try {
    if (deep) {
      const articles = await searchTavily(safeQuery);
      const response: SearchResponse = { articles, query: safeQuery, source: "tavily", totalCount: articles.length };
      return NextResponse.json(response);
    }

    const feed = await fetchAllSources();
    const q = safeQuery.toLowerCase();
    const local = feed.articles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
    );

    if (local.length >= 5) {
      return NextResponse.json({ articles: local.slice(0, 20), query: safeQuery, source: "local", totalCount: local.length });
    }

    const serperResults = await searchSerper(safeQuery);
    const combined = [...local, ...serperResults.filter((s) => !local.some((l) => l.url === s.url))];

    return NextResponse.json({ articles: combined.slice(0, 20), query: safeQuery, source: "serper", totalCount: combined.length });
  } catch (error) {
    console.error("[/api/search]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
