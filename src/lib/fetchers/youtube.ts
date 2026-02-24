import type { Article, SourceStats } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL, YOUTUBE_CHANNELS } from "../constants";
import { inferCategoryByKeyword, generateId, truncate } from "../utils";
import Parser from "rss-parser";

const CACHE_KEY = "fetcher:youtube";

type YoutubeItem = {
  videoId?: string;
  mediaGroup?: {
    "media:thumbnail"?: Array<{ $: { url: string } }>;
    "media:description"?: string[];
  };
};

const parser = new Parser<Record<string, unknown>, YoutubeItem>({
  timeout: 8000,
  customFields: {
    item: [
      ["yt:videoId", "videoId"],
      ["media:group", "mediaGroup"],
    ],
  },
});

export async function fetchYouTube(): Promise<{ articles: Article[]; stats: SourceStats }> {
  const start = Date.now();
  const cached = cache.get<Article[]>(CACHE_KEY);

  if (cached) {
    return {
      articles: cached,
      stats: {
        source: "youtube",
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
    YOUTUBE_CHANNELS.map(async (channel) => {
      try {
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
        const feedData = await parser.parseURL(feedUrl);
        const items = (feedData.items ?? []).slice(0, 8);

        for (const item of items) {
          if (!item.link || !item.title) continue;

          const videoId = item.videoId;
          const mediaGroup = item.mediaGroup;
          const thumbnail =
            mediaGroup?.["media:thumbnail"]?.[0]?.$.url ??
            (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined);
          const rawDesc =
            mediaGroup?.["media:description"]?.[0] ?? item.contentSnippet ?? "";
          const desc = truncate(rawDesc, 300);
          const category = inferCategoryByKeyword(item.title, desc) ?? "uncategorized";

          articles.push({
            id: generateId("youtube", item.link),
            title: item.title,
            url: item.link,
            description: desc,
            source: "youtube" as const,
            sourceName: channel.name,
            publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
            category,
            imageUrl: thumbnail,
          });
        }
      } catch (err) {
        errors.push(`${channel.name}: ${err instanceof Error ? err.message : "error"}`);
      }
    })
  );

  cache.set(CACHE_KEY, articles, TTL.YOUTUBE);
  const latency = Date.now() - start;

  return {
    articles,
    stats: {
      source: "youtube",
      count: articles.length,
      latency,
      status: errors.length > 0 && articles.length === 0 ? "error" : "ok",
      error: errors.join("; ") || undefined,
    },
  };
}
