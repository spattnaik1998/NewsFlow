import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL } from "../constants";
import { deduplicateArticles, scoreArticle } from "../deduplication";
import { fetchHackerNews } from "./hacker-news";
import { fetchReddit } from "./reddit";
import { fetchArxiv } from "./arxiv";
import { fetchDevTo } from "./devto";
import { fetchGitHubTrending } from "./github-trending";
import { fetchRSSFeeds } from "./rss-feeds";
import { fetchPress } from "./press";
import { fetchSerper } from "./serper";
import { fetchTavily } from "./tavily";
import { fetchNewsletters } from "./newsletter";
import { fetchYouTube } from "./youtube";

export interface AggregatedFeed {
  articles: Article[];
  sourceStats: SourceStats[];
  generatedAt: string;
  cached: boolean;
}

const CACHE_KEY = "feed:aggregated";

export async function fetchAllSources(): Promise<AggregatedFeed> {
  const cached = cache.get<AggregatedFeed>(CACHE_KEY);
  if (cached) {
    return { ...cached, cached: true };
  }

  const start = Date.now();

  // Fetch all sources concurrently (Reddit is internally sequential per sub)
  const results = await Promise.allSettled([
    fetchHackerNews(),
    fetchReddit(),
    fetchArxiv(),
    fetchDevTo(),
    fetchGitHubTrending(),
    fetchRSSFeeds(),
    fetchPress(),
    fetchSerper(),
    fetchTavily(),
    fetchNewsletters(),
    fetchYouTube(),
  ]);

  const allArticles: Article[] = [];
  const sourceStats: SourceStats[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value.articles);
      sourceStats.push(result.value.stats);
    }
  }

  // Score and deduplicate
  const scored = allArticles.map((a) => ({ ...a, score: scoreArticle(a) }));
  const unique = deduplicateArticles(scored);

  // Sort by score descending, then by date
  unique.sort((a, b) => {
    const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const feed: AggregatedFeed = {
    articles: unique,
    sourceStats,
    generatedAt: new Date().toISOString(),
    cached: false,
  };

  cache.set(CACHE_KEY, feed, TTL.FULL_FEED);
  console.log(`[NewsFlow] Aggregated ${unique.length} articles from ${sourceStats.length} sources in ${Date.now() - start}ms`);

  return feed;
}
