import type { SearchResponse } from "@/lib/types";
import { ArticleCard } from "@/components/feed/article-card";
import { SourceBadge } from "@/components/shared/source-badge";

interface SearchResultsProps {
  results: SearchResponse;
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{results.totalCount}</span> results for{" "}
          <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>
        </p>
        <SourceBadge source={results.source === "local" ? "hacker-news" : results.source} sourceName={results.source === "local" ? "Local cache" : undefined} />
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {results.articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
