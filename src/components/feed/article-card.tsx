"use client";

import Link from "next/link";
import { ExternalLink, MessageSquare, TrendingUp, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Article } from "@/lib/types";
import { SourceBadge } from "@/components/shared/source-badge";
import { CategoryChip } from "@/components/shared/category-chip";
import { TimeAgo } from "@/components/shared/time-ago";

interface ArticleCardProps {
  article: Article;
  className?: string;
  variant?: "default" | "compact";
  isSaved?: boolean;
  onSave?: (article: Article) => void;
}

export function ArticleCard({ article, className, variant = "default", isSaved, onSave }: ArticleCardProps) {
  const isCompact = variant === "compact";

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/60 bg-card",
        "transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
        "hover:-translate-y-0.5",
        isCompact ? "p-3" : "p-4",
        className
      )}
    >
      {/* Top row: source + time */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <SourceBadge source={article.source} sourceName={article.sourceName} />
        <span className="font-mono text-[11px] text-muted-foreground">
          <TimeAgo date={article.publishedAt} />
        </span>
      </div>

      {/* Title */}
      <Link
        href={`/article/${article.id}`}
        className="block group/title mb-1.5"
      >
        <h2
          className={cn(
            "font-semibold leading-snug text-foreground",
            "group-hover/title:text-amber-600 dark:group-hover/title:text-amber-400 transition-colors duration-150",
            "line-clamp-2",
            isCompact ? "text-sm" : "text-[15px]"
          )}
        >
          {article.title}
        </h2>
      </Link>

      {/* Description */}
      {!isCompact && article.description && (
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 mb-3 flex-1">
          {article.description}
        </p>
      )}

      {/* Bottom row: category + meta */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-2.5 border-t border-border/40">
        <CategoryChip category={article.category} />

        <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
          {article.score !== undefined && article.score > 0 && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {article.score.toLocaleString()}
            </span>
          )}
          {article.commentCount !== undefined && article.commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {article.commentCount}
            </span>
          )}
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(article); }}
              className={cn(
                "p-0.5 rounded transition-colors hover:bg-muted",
                isSaved ? "text-amber-500 hover:text-amber-600" : "hover:text-foreground"
              )}
              title={isSaved ? "Remove from reading list" : "Save to reading list"}
            >
              {isSaved ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
            </button>
          )}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:text-foreground transition-colors p-0.5 rounded hover:bg-muted"
            title="Open original"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
