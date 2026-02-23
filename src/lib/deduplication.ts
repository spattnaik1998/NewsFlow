import type { Article } from "./types";
import { computeContentHash, normalizeUrl } from "./utils";

export function deduplicateArticles(articles: Article[]): Article[] {
  const seen = new Map<string, Article>();

  for (const article of articles) {
    const combinedHash = computeContentHash(article.url, article.title);

    // Check by combined hash first (exact match)
    if (seen.has(combinedHash)) {
      const existing = seen.get(combinedHash)!;
      // Keep the one with higher score
      if ((article.score ?? 0) > (existing.score ?? 0)) {
        seen.set(combinedHash, article);
      }
      continue;
    }

    // Check by URL alone (same URL, different titles)
    const normalUrl = normalizeUrl(article.url);
    let found = false;
    for (const [key, existing] of seen.entries()) {
      if (normalizeUrl(existing.url) === normalUrl) {
        if ((article.score ?? 0) > (existing.score ?? 0)) {
          seen.delete(key);
          seen.set(combinedHash, article);
        }
        found = true;
        break;
      }
    }

    if (!found) {
      seen.set(combinedHash, article);
    }
  }

  return Array.from(seen.values());
}

export function scoreArticle(article: Article): number {
  let score = article.score ?? 0;

  // Boost based on source reliability
  const sourceBoosts: Record<string, number> = {
    "hacker-news": 10,
    "reddit": 5,
    "arxiv": 15,
    "devto": 3,
    "github": 8,
    "rss": 5,
    "serper": 7,
    "tavily": 12,
  };

  score += sourceBoosts[article.source] ?? 0;

  // Penalize old articles
  const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  if (ageHours > 24) score -= Math.min(20, Math.floor(ageHours / 24) * 5);

  return score;
}
