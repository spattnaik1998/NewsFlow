import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL, REDDIT_SUBREDDITS } from "../constants";
import { inferCategoryByKeyword, generateId, truncate, sleep } from "../utils";

const CACHE_KEY = "fetcher:reddit";

export async function fetchReddit(): Promise<{ articles: Article[]; stats: SourceStats }> {
  const start = Date.now();
  const cached = cache.get<Article[]>(CACHE_KEY);

  if (cached) {
    return {
      articles: cached,
      stats: { source: "reddit", count: cached.length, latency: 0, status: "cached", cachedAt: new Date(cache.getMetadata(CACHE_KEY)?.createdAt ?? 0).toISOString() },
    };
  }

  const articles: Article[] = [];

  try {
    for (let i = 0; i < REDDIT_SUBREDDITS.length; i++) {
      const sub = REDDIT_SUBREDDITS[i];
      if (i > 0) await sleep(1100); // 1.1s delay between requests

      try {
        const res = await fetch(
          `https://www.reddit.com/r/${sub}/hot.json?limit=10`,
          {
            headers: { "User-Agent": "NewsFlow/1.0 (tech news aggregator)" },
            next: { revalidate: 0 },
          }
        );

        if (!res.ok) continue;

        const data = await res.json();
        const posts = data?.data?.children ?? [];

        for (const { data: post } of posts) {
          if (!post.url || post.is_self || post.stickied) continue;
          const category = inferCategoryByKeyword(post.title, post.selftext ?? "") ?? "uncategorized";
          articles.push({
            id: generateId("reddit", post.url),
            title: post.title,
            url: post.url,
            description: truncate(post.selftext || post.title, 300),
            source: "reddit",
            sourceName: `r/${sub}`,
            publishedAt: new Date(post.created_utc * 1000).toISOString(),
            category,
            score: post.score ?? 0,
            commentCount: post.num_comments ?? 0,
            author: post.author,
          });
        }
      } catch {
        // Continue with other subreddits
      }
    }

    cache.set(CACHE_KEY, articles, TTL.REDDIT);
    const latency = Date.now() - start;

    return {
      articles,
      stats: { source: "reddit", count: articles.length, latency, status: "ok" },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      articles,
      stats: { source: "reddit", count: articles.length, latency: Date.now() - start, status: "error", error: msg },
    };
  }
}
