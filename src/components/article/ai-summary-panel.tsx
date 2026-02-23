"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AISummary } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface AISummaryPanelProps {
  articleId: string;
  className?: string;
}

function SentimentIcon({ sentiment }: { sentiment: AISummary["sentiment"] }) {
  if (sentiment === "positive") return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (sentiment === "negative") return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

const DEPTH_COLORS = {
  beginner: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  intermediate: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  advanced: "text-red-600 dark:text-red-400 bg-red-500/10",
};

export function AISummaryPanel({ articleId, className }: AISummaryPanelProps) {
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  async function generateSummary() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) throw new Error("Failed to generate summary");
      const data: AISummary = await res.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  if (!summary && !isLoading) {
    return (
      <div className={cn("rounded-xl border border-border/60 bg-card p-4", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">AI Summary</h3>
          <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded px-1.5 py-0.5 ml-auto">
            gpt-4o-mini
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Generate a TL;DR, key points, sentiment, and technical depth analysis.
        </p>
        {error && (
          <p className="text-xs text-destructive mb-2">{error}</p>
        )}
        <Button size="sm" onClick={generateSummary} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
          <Sparkles className="h-3.5 w-3.5" />
          Generate AI Summary
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-border/60 bg-card p-4", className)}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
          <h3 className="text-sm font-semibold">AI Summary</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing article…
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className={cn("rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5 p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold">AI Summary</h3>
        <div className="flex items-center gap-1.5 ml-auto">
          <SentimentIcon sentiment={summary.sentiment} />
          <span
            className={cn(
              "text-[10px] font-mono rounded px-1.5 py-0.5 capitalize",
              DEPTH_COLORS[summary.technicalDepth]
            )}
          >
            {summary.technicalDepth}
          </span>
          <button onClick={() => setExpanded((e) => !e)} className="text-muted-foreground hover:text-foreground ml-1">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* TL;DR */}
      <p className="text-sm font-medium leading-relaxed text-foreground mb-3 italic">
        &ldquo;{summary.tldr}&rdquo;
      </p>

      {expanded && summary.keyPoints.length > 0 && (
        <ul className="space-y-1.5">
          {summary.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              {point}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[10px] text-muted-foreground/50 font-mono">
        Generated {new Date(summary.generatedAt).toLocaleTimeString()} · cached 1h
      </p>
    </div>
  );
}
