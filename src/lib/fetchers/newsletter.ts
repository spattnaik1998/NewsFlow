import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL, NEWSLETTER_FEEDS } from "../constants";
import { inferCategoryByKeyword, generateId, truncate } from "../utils";
import Parser from "rss-parser";

const CACHE_KEY = "fetcher:newsletter";
const parser = new Parser({ timeout: 8000 });

export async function fetchNewsletters(): Promise<{ articles: Article[]; stats: SourceStats }> {
  const start = Date.now();
  const cached = cache.get<Article[]>(CACHE_KEY);

  if (cached) {
    return {
      articles: cached,
      stats: {
        source: "newsletter",
        count: cached.length,
        latency: 0,
        status: "cached",
        cachedAt: new Date(cache.getMetadata(CACHE_KEY)?.createdAt ?? 0).toISOString(),
      },
    };
  }

  const articles: Article[] = [];
  const errors: string[] = [];

  await Promise.allSettled(
    NEWSLETTER_FEEDS.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed.url);
        const items = (feedData.items ?? []).slice(0, 10);

        for (const item of items) {
          if (!item.link || !item.title) continue;
          const desc = truncate(
            item.contentSnippet || item.summary || item.content || item.title,
            300
          );
          const category = inferCategoryByKeyword(item.title, desc) ?? "uncategorized";

          articles.push({
            id: generateId("newsletter", item.link),
            title: item.title,
            url: item.link,
            description: desc,
            source: "newsletter" as const,
            sourceName: feed.name,
            publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
            category,
            author: item.creator ?? item.author,
            imageUrl: (item as { enclosure?: { url?: string } }).enclosure?.url,
          });
        }
      } catch (err) {
        errors.push(`${feed.name}: ${err instanceof Error ? err.message : "error"}`);
      }
    })
  );

  cache.set(CACHE_KEY, articles, TTL.NEWSLETTER);
  const latency = Date.now() - start;

  return {
    articles,
    stats: {
      source: "newsletter",
      count: articles.length,
      latency,
      status: errors.length > 0 && articles.length === 0 ? "error" : "ok",
      error: errors.join("; ") || undefined,
    },
  };
}
