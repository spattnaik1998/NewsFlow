import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL, ARXIV_CATEGORIES } from "../constants";
import { inferCategoryByKeyword, generateId, truncate } from "../utils";
import { parseStringPromise } from "xml2js";

const CACHE_KEY = "fetcher:arxiv";

export async function fetchArxiv(): Promise<{ articles: Article[]; stats: SourceStats }> {
  const start = Date.now();
  const cached = cache.get<Article[]>(CACHE_KEY);

  if (cached) {
    return {
      articles: cached,
      stats: { source: "arxiv", count: cached.length, latency: 0, status: "cached", cachedAt: new Date(cache.getMetadata(CACHE_KEY)?.createdAt ?? 0).toISOString() },
    };
  }

  try {
    const categoryQuery = ARXIV_CATEGORIES.map((c) => `cat:${c}`).join("+OR+");
    const url = `https://export.arxiv.org/api/query?search_query=${categoryQuery}&sortBy=submittedDate&sortOrder=descending&max_results=20`;

    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`arXiv API error: ${res.status}`);

    const xml = await res.text();
    const parsed = await parseStringPromise(xml, { explicitArray: false });
    const entries = parsed?.feed?.entry ?? [];
    const entryList = Array.isArray(entries) ? entries : [entries];

    const articles: Article[] = entryList
      .filter((entry: { id?: string; title?: string }) => entry.id && entry.title)
      .map((entry: {
        id: string;
        title: string;
        summary?: string;
        published?: string;
        author?: { name?: string } | Array<{ name?: string }>;
        category?: { $?: { term?: string } } | Array<{ $?: { term?: string } }>;
      }) => {
        const authors = Array.isArray(entry.author) ? entry.author : [entry.author];
        const authorName = authors[0]?.name ?? "Unknown";
        const categories = Array.isArray(entry.category) ? entry.category : [entry.category];
        const mainCat = categories[0]?.$?.term ?? "cs.AI";
        const desc = truncate(entry.summary?.replace(/\s+/g, " ").trim() ?? "", 300);
        const category = inferCategoryByKeyword(entry.title, desc) ?? "research";

        return {
          id: generateId("arxiv", entry.id),
          title: entry.title.replace(/\s+/g, " ").trim(),
          url: entry.id,
          description: desc,
          source: "arxiv" as const,
          sourceName: `arXiv (${mainCat})`,
          publishedAt: entry.published ?? new Date().toISOString(),
          category,
          author: authorName,
          tags: [mainCat],
        };
      });

    cache.set(CACHE_KEY, articles, TTL.ARXIV);
    const latency = Date.now() - start;

    return {
      articles,
      stats: { source: "arxiv", count: articles.length, latency, status: "ok" },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return {
      articles: [],
      stats: { source: "arxiv", count: 0, latency: Date.now() - start, status: "error", error: msg },
    };
  }
}
