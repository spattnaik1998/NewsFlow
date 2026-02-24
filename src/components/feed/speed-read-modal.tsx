"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { X, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Article, AISummary } from "@/lib/types";
import { SourceBadge } from "@/components/shared/source-badge";
import { TimeAgo } from "@/components/shared/time-ago";
import { Button } from "@/components/ui/button";

interface SpeedReadModalProps {
  articles: Article[];
  savedIds: Set<string>;
  onSave: (article: Article) => void;
  onClose: () => void;
}

function SentimentChip({ sentiment }: { sentiment: AISummary["sentiment"] }) {
  if (sentiment === "positive")
    return (
      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-0.5">
        <TrendingUp className="h-3 w-3" /> positive
      </span>
    );
  if (sentiment === "negative")
    return (
      <span className="flex items-center gap-1 text-[10px] font-mono text-red-600 dark:text-red-400 bg-red-500/10 rounded px-1.5 py-0.5">
        <TrendingDown className="h-3 w-3" /> negative
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-500/10 rounded px-1.5 py-0.5">
      <Minus className="h-3 w-3" /> neutral
    </span>
  );
}

export function SpeedReadModal({ articles, savedIds, onSave, onClose }: SpeedReadModalProps) {
  const [index, setIndex] = useState(0);
  const [summaries, setSummaries] = useState<Map<string, AISummary>>(new Map());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const prefetched = useRef<Set<string>>(new Set());

  const article = articles[index];
  const total = articles.length;

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const fetchSummary = useCallback(async (a: Article) => {
    if (prefetched.current.has(a.id)) return;
    prefetched.current.add(a.id);
    setLoadingIds((s) => new Set(s).add(a.id));
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: a.id }),
      });
      if (!res.ok) return;
      const data: AISummary = await res.json();
      setSummaries((m) => new Map(m).set(a.id, data));
    } catch {
      // silently fail
    } finally {
      setLoadingIds((s) => { const n = new Set(s); n.delete(a.id); return n; });
    }
  }, []);

  // Pre-fetch current + next 2
  useEffect(() => {
    for (let i = index; i < Math.min(index + 3, total); i++) {
      if (articles[i]) fetchSummary(articles[i]);
    }
  }, [index, articles, total, fetchSummary]);

  const goNext = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  // Keyboard bindings
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight" || e.key === "l" || e.key === "j") { goNext(); return; }
      if (e.key === "ArrowLeft" || e.key === "h" || e.key === "k") { goPrev(); return; }
      if (e.key === " ") { e.preventDefault(); if (article) onSave(article); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goNext, goPrev, onSave, article]);

  if (!article) return null;

  const summary = summaries.get(article.id);
  const isLoading = loadingIds.has(article.id);
  const isSaved = savedIds.has(article.id);
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Progress bar */}
      <div className="h-1 bg-border/40 flex-shrink-0">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 flex-shrink-0">
        <div className="flex items-center gap-3">
          <SourceBadge source={article.source} sourceName={article.sourceName} />
          <span className="font-mono text-xs text-muted-foreground">
            <TimeAgo date={article.publishedAt} />
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {index + 1} / {total}
          </span>
          <button
            onClick={() => onSave(article)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isSaved
                ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={isSaved ? "Unsave (Space)" : "Save (Space)"}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold leading-snug mb-6">{article.title}</h1>

          {/* AI TL;DR */}
          <div className="mb-6">
            {isLoading ? (
              <div className="border-l-4 border-amber-500 pl-4 py-2">
                <p className="text-sm text-muted-foreground animate-pulse">Generating AI summary…</p>
              </div>
            ) : summary ? (
              <div className="border-l-4 border-amber-500 pl-4 py-1 mb-4">
                <p className="text-sm font-medium italic leading-relaxed">&ldquo;{summary.tldr}&rdquo;</p>
              </div>
            ) : (
              <div className="border-l-4 border-border pl-4 py-1 mb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{article.description}</p>
              </div>
            )}

            {summary && (
              <>
                {summary.keyPoints.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {summary.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-amber-500 font-bold mt-0.5">·</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
                <SentimentChip sentiment={summary.sentiment} />
              </>
            )}
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-mono"
          >
            Read full article →
          </a>
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={index === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        <p className="text-[10px] font-mono text-muted-foreground/60 hidden sm:block">
          ← → navigate · Space bookmark · Esc close
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={index === total - 1}
          className="gap-1.5"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
