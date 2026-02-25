import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL } from "../constants";
import { inferCategoryByKeyword, generateId, truncate } from "../utils";

const CACHE_KEY = "fetcher:devto";

export async function fetchDevTo(): Promise<{ articles: Article[]; stats: SourceStats }> {
  const start = Date.now();
  const cached = cache.get<Article[]>(CACHE_KEY);

  if (cached) {
    return {
      articles: cached,
      stats: { source: "devto", count: cached.length, latency: 0, status: "cached", cachedAt: new Date(cache.getMetadata(CACHE_KEY)?.createdAt ?? 0).toISOString() },
    };
  }

  try {
    const res = await fetch(
      "https://dev.to/api/articles?per_page=20&top=1",
      { next: { revalidate: 0 } }
    );

    if (!res.ok) throw new Error(`Dev.to API error: ${res.status}`);

    const data = await res.json();
    const articles: Article[] = data
      .filter((item: { url?: string; title?: string }) => item.url && item.title)
      .map((item: {
        id: number;
        url: string;
        title: string;
        description?: string;
        user?: { name?: string };
        published_at?: string;
        positive_reactions_count?: number;
        comments_count?: number;
        tag_list?: string[];
        cover_image?: string;
      }) => {
        const category = inferCategoryByKeyword(item.title, item.description ?? "") ?? "web-dev";
        return {
          id: generateId("devto", item.url),
          title: item.title,
          url: item.url,
          description: truncate(item.description ?? "", 300),
          source: "devto" as const,
          sourceName: "Dev.to",
          publishedAt: item.published_at ?? new Date().toISOString(),
          category,
          score: item.positive_reactions_count ?? 0,
          commentCount: item.comments_count ?? 0,
          author: item.user?.name,
          tags: item.tag_list ?? [],
          imageUrl: item.cover_image,
        };
      });

    cache.set(CACHE_KEY, articles, TTL.DEVTO);
    const latency = Date.now() - start;

    return {
      articles,
      stats: { source: "devto", count: articles.length, latency, status: "ok" },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      articles: [],
      stats: { source: "devto", count: 0, latency: Date.now() - start, status: "error", error: msg },
    };
  }
}
