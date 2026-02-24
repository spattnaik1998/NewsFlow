import { cn } from "@/lib/utils";
import type { Article } from "@/lib/types";
import { ArticleCard } from "./article-card";

interface ArticleGridProps {
  articles: Article[];
  className?: string;
  savedIds?: Set<string>;
  onSave?: (article: Article) => void;
}

export function ArticleGrid({ articles, className, savedIds, onSave }: ArticleGridProps) {
  if (articles.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          isSaved={savedIds?.has(article.id)}
          onSave={onSave}
        />
      ))}
    </div>
  );
}
