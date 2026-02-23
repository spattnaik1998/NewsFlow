import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import { searchSerper } from "@/lib/fetchers/serper";
import { searchTavily } from "@/lib/fetchers/tavily";
import type { SearchResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get("q")?.trim();
  const deep = searchParams.get("deep") === "true";

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  try {
    if (deep) {
      // Tavily deep search
      const articles = await searchTavily(query);
      const response: SearchResponse = {
        articles,
        query,
        source: "tavily",
        totalCount: articles.length,
      };
      return NextResponse.json(response);
    }

    // First try local cache
    const feed = await fetchAllSources();
    const q = query.toLowerCase();
    const local = feed.articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );

    if (local.length >= 5) {
      const response: SearchResponse = {
        articles: local.slice(0, 20),
        query,
        source: "local",
        totalCount: local.length,
      };
      return NextResponse.json(response);
    }

    // Serper for live search
    const serperResults = await searchSerper(query);
    const combined = [...local, ...serperResults.filter(
      (s) => !local.some((l) => l.url === s.url)
    )];

    const response: SearchResponse = {
      articles: combined.slice(0, 20),
      query,
      source: "serper",
      totalCount: combined.length,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("[/api/search]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
