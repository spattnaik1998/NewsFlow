import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL } from "../constants";
import { inferCategoryByKeyword, generateId, truncate } from "../utils";

const CACHE_KEY = "fetcher:hacker-news";

export async function fetchHackerNews(): Promise<{ articles: Article[]; stats: SourceStats }> {
  const start = Date.now();
  const cached = cache.get<Article[]>(CACHE_KEY);

  if (cached) {
    return {
      articles: cached,
      stats: { source: "hacker-news", count: cached.length, latency: 0, status: "cached", cachedAt: new Date(cache.getMetadata(CACHE_KEY)?.createdAt ?? 0).toISOString() },
    };
  }

  try {
    const res = await fetch(
      "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30",
      { next: { revalidate: 0 } }
    );

    if (!res.ok) throw new Error(`HN API error: ${res.status}`);

    const data = await res.json();
    const articles: Article[] = (data.hits ?? [])
      .filter((hit: { url?: string; title?: string }) => hit.url && hit.title)
      .map((hit: {
        objectID: string;
        url: string;
        title: string;
        story_text?: string;
        author?: string;
        points?: number;
        num_comments?: number;
        created_at?: string;
      }) => {
        const category = inferCategoryByKeyword(hit.title, hit.story_text ?? "") ?? "uncategorized";
        return {
          id: generateId("hacker-news", hit.url),
          title: hit.title,
          url: hit.url,
          description: truncate(hit.story_text ?? hit.title, 300),
          source: "hacker-news" as const,
          sourceName: "Hacker News",
          publishedAt: hit.created_at ?? new Date().toISOString(),
          category,
          score: hit.points ?? 0,
          commentCount: hit.num_comments ?? 0,
          author: hit.author,
        };
      });

    cache.set(CACHE_KEY, articles, TTL.HACKER_NEWS);
    const latency = Date.now() - start;

    return {
      articles,
      stats: { source: "hacker-news", count: articles.length, latency, status: "ok" },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      articles: [],
      stats: { source: "hacker-news", count: 0, latency: Date.now() - start, status: "error", error: msg },
    };
  }
}
