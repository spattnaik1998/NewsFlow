import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL } from "../constants";
import { inferCategoryByKeyword, generateId, truncate } from "../utils";

const CACHE_KEY = "fetcher:github";

export async function fetchGitHubTrending(): Promise<{ articles: Article[]; stats: SourceStats }> {
  const start = Date.now();
  const cached = cache.get<Article[]>(CACHE_KEY);

  if (cached) {
    return {
      articles: cached,
      stats: { source: "github", count: cached.length, latency: 0, status: "cached", cachedAt: new Date(cache.getMetadata(CACHE_KEY)?.createdAt ?? 0).toISOString() },
    };
  }

  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const url = `https://api.github.com/search/repositories?q=stars:>100+pushed:>${oneWeekAgo}&sort=stars&order=desc&per_page=20`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NewsFlow/1.0",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data = await res.json();
    const articles: Article[] = (data.items ?? [])
      .map((repo: {
        html_url: string;
        full_name: string;
        description?: string;
        owner?: { login?: string };
        stargazers_count?: number;
        pushed_at?: string;
        topics?: string[];
        language?: string;
      }) => {
        const desc = truncate(repo.description ?? `A trending GitHub repository with ${repo.stargazers_count ?? 0} stars`, 300);
        const category = inferCategoryByKeyword(repo.full_name, desc) ?? "open-source";
        return {
          id: generateId("github", repo.html_url),
          title: `⭐ ${repo.full_name}`,
          url: repo.html_url,
          description: desc,
          source: "github" as const,
          sourceName: "GitHub Trending",
          publishedAt: repo.pushed_at ?? new Date().toISOString(),
          category,
          score: repo.stargazers_count ?? 0,
          author: repo.owner?.login,
          tags: [...(repo.topics ?? []), repo.language].filter(Boolean) as string[],
        };
      });

    cache.set(CACHE_KEY, articles, TTL.GITHUB);
    const latency = Date.now() - start;

    return {
      articles,
      stats: { source: "github", count: articles.length, latency, status: "ok" },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      articles: [],
      stats: { source: "github", count: 0, latency: Date.now() - start, status: "error", error: msg },
    };
  }
}
