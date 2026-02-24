import type { Article } from "./types";
import { computeContentHash, normalizeUrl } from "./utils";

export function deduplicateArticles(articles: Article[]): Article[] {
  const seen = new Map<string, Article>();

  for (const article of articles) {
    const combinedHash = computeContentHash(article.url, article.title);

    // Check by combined hash first (exact match)
    if (seen.has(combinedHash)) {
      const existing = seen.get(combinedHash)!;
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

/**
 * Normalize raw scores per-source so GitHub star counts (100k+) don't bury
 * HN/Reddit posts (200–3000 points). Each source gets a 0–100 normalized score,
 * then we add source-quality and recency bonuses.
 */
export function scoreArticle(article: Article): number {
  const rawScore = article.score ?? 0;

  // Per-source max scale for normalization
  const sourceMax: Record<string, number> = {
    "hacker-news": 3000,
    "reddit": 50000,
    "arxiv": 500,
    "devto": 2000,
    "github": 500000,
    "rss": 100,
    "press": 100,
    "serper": 100,
    "tavily": 100,
    "newsletter": 100,
    "youtube": 100,
  };

  const max = sourceMax[article.source] ?? 1000;
  // Normalize to 0–60 range
  const normalized = Math.min(60, (rawScore / max) * 60);

  // Source quality bonus (0–20)
  const sourceBonus: Record<string, number> = {
    "hacker-news": 20,
    "arxiv": 18,
    "newsletter": 16,
    "tavily": 16,
    "press": 15,
    "youtube": 14,
    "rss": 12,
    "reddit": 12,
    "serper": 10,
    "github": 8,
    "devto": 6,
  };
  const bonus = sourceBonus[article.source] ?? 5;

  // Recency bonus: up to 20 points, decays over 48h
  const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / 3_600_000;
  const recency = Math.max(0, 20 - Math.floor(ageHours / 2.4));

  return Math.round(normalized + bonus + recency);
}
