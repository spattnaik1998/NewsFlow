import { ExternalLink, ArrowLeft, TrendingUp, MessageSquare, User, Calendar } from "lucide-react";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { SourceBadge } from "@/components/shared/source-badge";
import { CategoryChip } from "@/components/shared/category-chip";
import { TimeAgo } from "@/components/shared/time-ago";
import { Button } from "@/components/ui/button";

interface ArticleHeroProps {
  article: Article;
}

export function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-muted-foreground text-sm">/</span>
        <CategoryChip category={article.category} />
      </div>

      <h1 className="text-2xl md:text-3xl font-bold leading-tight text-foreground mb-4">
        {article.title}
      </h1>

      {article.description && (
        <p className="text-muted-foreground text-base leading-relaxed mb-5">
          {article.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground border-t border-border/60 pt-4">
        <SourceBadge source={article.source} sourceName={article.sourceName} />

        {article.author && (
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {article.author}
          </span>
        )}

        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          <TimeAgo date={article.publishedAt} />
        </span>

        {article.score !== undefined && article.score > 0 && (
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {article.score.toLocaleString()} points
          </span>
        )}

        {article.commentCount !== undefined && article.commentCount > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {article.commentCount} comments
          </span>
        )}

        <div className="ml-auto">
          <Button asChild size="sm" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Read Original
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
