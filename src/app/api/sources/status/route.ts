import { NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import { SOURCE_LABELS } from "@/lib/constants";
import type { SourceHealth } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feed = await fetchAllSources();

    const health: SourceHealth[] = feed.sourceStats.map((stat) => ({
      source: stat.source,
      name: SOURCE_LABELS[stat.source] ?? stat.source,
      status:
        stat.status === "error"
          ? "down"
          : stat.status === "cached"
          ? "healthy"
          : stat.latency > 15000
          ? "degraded"
          : "healthy",
      lastFetchAt: stat.cachedAt ?? feed.generatedAt,
      articleCount: stat.count,
      avgLatencyMs: stat.latency,
      errors: stat.error ? [stat.error] : [],
    }));

    return NextResponse.json({
      sources: health,
      totalArticles: feed.articles.length,
      generatedAt: feed.generatedAt,
      cached: feed.cached,
    });
  } catch (error) {
    console.error("[/api/sources/status]", error);
    return NextResponse.json({ error: "Failed to fetch source status" }, { status: 500 });
  }
}
