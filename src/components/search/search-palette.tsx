"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Zap, Loader2 } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { SourceBadge } from "@/components/shared/source-badge";
import { CategoryChip } from "@/components/shared/category-chip";
import { TimeAgo } from "@/components/shared/time-ago";

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, results, isLoading, isDeep, deepSearch, clearResults } = useSearch();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      clearResults();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else inputRef.current?.focus();
      }
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin flex-shrink-0" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tech articles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {results && results.articles.length > 0 && (
          <div className="max-h-[50vh] overflow-y-auto">
            <div className="px-3 py-2 flex items-center justify-between border-b border-border/40">
              <span className="text-[11px] text-muted-foreground font-mono">
                {results.totalCount} results via{" "}
                <span className="text-foreground">{results.source}</span>
              </span>
              {!isDeep && (
                <button
                  onClick={deepSearch}
                  className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <Zap className="h-3 w-3" />
                  Deep search
                </button>
              )}
            </div>
            <ul>
              {results.articles.map((article) => (
                <li key={article.id}>
                  <button
                    className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors border-b border-border/20 last:border-0"
                    onClick={() => {
                      router.push(`/article/${article.id}`);
                      onClose();
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-1 mb-1">{article.title}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <SourceBadge source={article.source} sourceName={article.sourceName} />
                          <CategoryChip category={article.category} asLink={false} />
                          <span className="font-mono text-[10px] text-muted-foreground">
                            <TimeAgo date={article.publishedAt} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {results && results.articles.length === 0 && query.length >= 2 && !isLoading && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No results for &ldquo;{query}&rdquo;
            {!isDeep && (
              <div className="mt-2">
                <button
                  onClick={deepSearch}
                  className="text-amber-600 dark:text-amber-400 hover:underline text-xs flex items-center gap-1 mx-auto"
                >
                  <Zap className="h-3 w-3" />
                  Try deep search
                </button>
              </div>
            )}
          </div>
        )}

        {!results && !isLoading && (
          <div className="px-4 py-4 text-[11px] text-muted-foreground font-mono">
            Type to search across all 8 sources
          </div>
        )}
      </div>
    </div>
  );
}
