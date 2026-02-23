import type { Article } from "@/lib/types";
import { ArticleCard } from "@/components/feed/article-card";

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="text-amber-500">—</span>
        Related Articles
      </h2>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {articles.slice(0, 4).map((article) => (
          <ArticleCard key={article.id} article={article} variant="compact" />
        ))}
      </div>
    </div>
  );
}
