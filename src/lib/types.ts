export type Category =
  | "ai-ml"
  | "web-dev"
  | "security"
  | "hardware"
  | "open-source"
  | "cloud-devops"
  | "mobile"
  | "research"
  | "programming"
  | "business-tech"
  | "uncategorized";

export type Source =
  | "hacker-news"
  | "reddit"
  | "arxiv"
  | "devto"
  | "github"
  | "rss"
  | "press"
  | "serper"
  | "tavily"
  | "newsletter"
  | "youtube";

export type Sentiment = "positive" | "negative" | "neutral";

export interface Article {
  id: string;
  title: string;
  url: string;
  description: string;
  source: Source;
  sourceName: string;
  publishedAt: string;
  category: Category;
  score?: number;
  commentCount?: number;
  author?: string;
  tags?: string[];
  imageUrl?: string;
}

export interface AISummary {
  articleId: string;
  tldr: string;
  keyPoints: string[];
  sentiment: Sentiment;
  technicalDepth: "beginner" | "intermediate" | "advanced";
  generatedAt: string;
}

export interface SourceStats {
  source: Source;
  count: number;
  latency: number;
  status: "ok" | "error" | "cached";
  error?: string;
  cachedAt?: string;
}

export interface FeedResponse {
  articles: Article[];
  totalCount: number;
  sourceStats: SourceStats[];
  generatedAt: string;
  cached: boolean;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ArticleResponse {
  article: Article;
  summary?: AISummary;
  relatedArticles: Article[];
}

export interface SearchResponse {
  articles: Article[];
  query: string;
  source: "serper" | "tavily" | "local";
  totalCount: number;
}

export interface SourceHealth {
  source: Source;
  name: string;
  status: "healthy" | "degraded" | "down";
  lastFetchAt?: string;
  articleCount: number;
  avgLatencyMs: number;
  errors: string[];
}

export interface DailyBriefing {
  headline: string;
  lede: string;
  sections: { theme: string; narrative: string; articleIds: string[] }[];
  watchFor: string;
  generatedAt: string;
}

export interface ArticleInsight {
  soWhat: string;
  firstPrinciple: string;
  learnMore: string[];
  thinkAbout: string;
  generatedAt: string;
}

export interface FeedFilters {
  category?: Category;
  source?: Source;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "date" | "score";
}
