import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL, SERPER_QUERIES } from "../constants";
import { inferCategoryByKeyword, generateId, truncate } from "../utils";

const CACHE_KEY = "fetcher:serper";
const SEARCH_CACHE_PREFIX = "search:serper:";

export async function fetchSerper(): Promise<{ articles: Article[]; stats: SourceStats }> {
  const start = Date.now();
  const cached = cache.get<Article[]>(CACHE_KEY);

  if (cached) {
    return {
      articles: cached,
      stats: { source: "serper", count: cached.length, latency: 0, status: "cached", cachedAt: new Date(cache.getMetadata(CACHE_KEY)?.createdAt ?? 0).toISOString() },
    };
  }

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    return {
      articles: [],
      stats: { source: "serper", count: 0, latency: 0, status: "error", error: "Missing SERPER_API_KEY" },
    };
  }

  try {
    const articles: Article[] = [];

    // Only fetch from the first 3 queries to limit API calls
    const queries = SERPER_QUERIES.slice(0, 3);

    await Promise.allSettled(
      queries.map(async (query) => {
        const res = await fetch("https://google.serper.dev/news", {
          method: "POST",
          headers: {
            "X-API-KEY": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ q: query, num: 10 }),
        });

        if (!res.ok) return;
        const data = await res.json();

        for (const item of data.news ?? []) {
          if (!item.link || !item.title) continue;
          const desc = truncate(item.snippet ?? item.title, 300);
          const category = inferCategoryByKeyword(item.title, desc) ?? "uncategorized";
          articles.push({
            id: generateId("serper", item.link),
            title: item.title,
            url: item.link,
            description: desc,
            source: "serper" as const,
            sourceName: item.source ?? "Google News",
            publishedAt: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
            category,
            imageUrl: item.imageUrl,
          });
        }
      })
    );

    cache.set(CACHE_KEY, articles, TTL.SERPER);
    const latency = Date.now() - start;

    return {
      articles,
      stats: { source: "serper", count: articles.length, latency, status: "ok" },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      articles: [],
      stats: { source: "serper", count: 0, latency: Date.now() - start, status: "error", error: msg },
    };
  }
}

export async function searchSerper(query: string): Promise<Article[]> {
  const cacheKey = SEARCH_CACHE_PREFIX + query.toLowerCase().trim();
  const cached = cache.get<Article[]>(cacheKey);
  if (cached) return cached;

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://google.serper.dev/news", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: `${query} technology`, num: 15 }),
    });

    if (!res.ok) return [];
    const data = await res.json();

    const articles: Article[] = (data.news ?? [])
      .filter((item: { link?: string; title?: string }) => item.link && item.title)
      .map((item: {
        link: string;
        title: string;
        snippet?: string;
        source?: string;
        date?: string;
        imageUrl?: string;
      }) => {
        const desc = truncate(item.snippet ?? "", 300);
        return {
          id: generateId("serper", item.link),
          title: item.title,
          url: item.link,
          description: desc,
          source: "serper" as const,
          sourceName: item.source ?? "Google News",
          publishedAt: item.date ? new Date(item.date).toISOString() : new Date().toISOString(),
          category: inferCategoryByKeyword(item.title, desc) ?? "uncategorized",
          imageUrl: item.imageUrl,
        };
      });

    cache.set(cacheKey, articles, TTL.SERPER);
    return articles;
  } catch {
    return [];
  }
}
