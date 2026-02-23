import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import type { FeedResponse, Category, Source, FeedFilters } from "@/lib/types";
import { PAGE_SIZE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filters: FeedFilters = {
    category: searchParams.get("category") as Category | undefined,
    source: searchParams.get("source") as Source | undefined,
    search: searchParams.get("search") ?? undefined,
    page: parseInt(searchParams.get("page") ?? "1"),
    pageSize: parseInt(searchParams.get("pageSize") ?? String(PAGE_SIZE)),
    sortBy: (searchParams.get("sortBy") ?? "score") as "date" | "score",
  };

  try {
    const feed = await fetchAllSources();
    let articles = feed.articles;

    // Apply filters
    if (filters.category && filters.category !== "uncategorized") {
      articles = articles.filter((a) => a.category === filters.category);
    }
    if (filters.source) {
      articles = articles.filter((a) => a.source === filters.source);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.sourceName.toLowerCase().includes(q)
      );
    }

    // Sort
    if (filters.sortBy === "date") {
      articles = articles.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    // Paginate
    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? PAGE_SIZE, 100);
    const start = (page - 1) * pageSize;
    const paginated = articles.slice(start, start + pageSize);

    const response: FeedResponse = {
      articles: paginated,
      totalCount: articles.length,
      sourceStats: feed.sourceStats,
      generatedAt: feed.generatedAt,
      cached: feed.cached,
      page,
      pageSize,
      hasMore: start + pageSize < articles.length,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "X-Cache": feed.cached ? "HIT" : "MISS",
      },
    });
  } catch (error) {
    console.error("[/api/feed]", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
