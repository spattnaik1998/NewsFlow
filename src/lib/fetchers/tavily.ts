import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL } from "../constants";
import { inferCategoryByKeyword, generateId, truncate } from "../utils";

const CACHE_KEY_PREFIX = "fetcher:tavily:";

export async function fetchTavily(): Promise<{ articles: Article[]; stats: SourceStats }> {
  // Tavily is only used for deep search, not background aggregation
  return {
    articles: [],
    stats: { source: "tavily", count: 0, latency: 0, status: "ok" },
  };
}

export async function searchTavily(query: string): Promise<Article[]> {
  const cacheKey = CACHE_KEY_PREFIX + query.toLowerCase().trim();
  const cached = cache.get<Article[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "advanced",
        include_news: true,
        max_results: 15,
        topic: "technology",
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();

    const articles: Article[] = (data.results ?? [])
      .filter((item: { url?: string; title?: string }) => item.url && item.title)
      .map((item: {
        url: string;
        title: string;
        content?: string;
        score?: number;
        published_date?: string;
      }) => {
        const desc = truncate(item.content ?? "", 300);
        return {
          id: generateId("tavily", item.url),
          title: item.title,
          url: item.url,
          description: desc,
          source: "tavily" as const,
          sourceName: "Deep Search",
          publishedAt: item.published_date ?? new Date().toISOString(),
          category: inferCategoryByKeyword(item.title, desc) ?? "uncategorized",
          score: Math.round((item.score ?? 0) * 100),
        };
      });

    cache.set(cacheKey, articles, TTL.TAVILY);
    return articles;
  } catch {
    return [];
  }
}
