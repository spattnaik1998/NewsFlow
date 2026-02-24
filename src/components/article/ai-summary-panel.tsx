"use client";

import { useState } from "react";
import {
  Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle2,
  TrendingUp, TrendingDown, Minus, Lightbulb, Atom,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AISummary, ArticleInsight } from "@/lib/types";
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
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const [insight, setInsight] = useState<ArticleInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  async function generateSummary() {
    setSummaryLoading(true);
    setSummaryError(null);
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
      setSummaryError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function generateInsight() {
    setInsightLoading(true);
    setInsightError(null);
    try {
      const res = await fetch("/api/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) throw new Error("Failed to generate insight");
      const data: ArticleInsight = await res.json();
      setInsight(data);
    } catch (err) {
      setInsightError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setInsightLoading(false);
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* AI Summary section */}
      <div
        className={cn(
          "rounded-xl border p-4",
          summary
            ? "border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5"
            : "border-border/60 bg-card"
        )}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className={cn("h-4 w-4 text-amber-500", summaryLoading && "animate-pulse")} />
          <h3 className="text-sm font-semibold">AI Summary</h3>
          {summary ? (
            <div className="flex items-center gap-1.5 ml-auto">
              <SentimentIcon sentiment={summary.sentiment} />
              <span className={cn("text-[10px] font-mono rounded px-1.5 py-0.5 capitalize", DEPTH_COLORS[summary.technicalDepth])}>
                {summary.technicalDepth}
              </span>
              <button onClick={() => setExpanded((e) => !e)} className="text-muted-foreground hover:text-foreground ml-1">
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded px-1.5 py-0.5 ml-auto">
              gpt-4o-mini
            </span>
          )}
        </div>

        {!summary && !summaryLoading && (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              Generate a TL;DR, key points, sentiment, and technical depth analysis.
            </p>
            {summaryError && <p className="text-xs text-destructive mb-2">{summaryError}</p>}
            <Button size="sm" onClick={generateSummary} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Generate AI Summary
            </Button>
          </>
        )}

        {summaryLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing article…
          </div>
        )}

        {summary && (
          <>
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
          </>
        )}
      </div>

      {/* Intelligence Layer — only visible after summary exists */}
      {summary && (
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">So What?</h3>
            <span className="text-[10px] font-mono text-muted-foreground/60 ml-auto">
              Intelligence Layer
            </span>
          </div>

          {!insight && !insightLoading && (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                Practical implications, first principles, and what to explore next.
              </p>
              {insightError && <p className="text-xs text-destructive mb-2">{insightError}</p>}
              <Button
                size="sm"
                variant="outline"
                onClick={generateInsight}
                className="gap-2 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Generate Insight
              </Button>
            </>
          )}

          {insightLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking deeper…
            </div>
          )}

          {insight && (
            <div className="space-y-4">
              {/* So What */}
              <div className="flex items-start gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed">{insight.soWhat}</p>
              </div>

              {/* First Principle */}
              <div className="flex items-start gap-2">
                <Atom className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-1">
                    First Principle
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.firstPrinciple}</p>
                </div>
              </div>

              {/* Learn More */}
              {insight.learnMore.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 mb-2">
                    Learn More
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {insight.learnMore.map((topic, i) => (
                      <a
                        key={i}
                        href={`https://www.google.com/search?q=${encodeURIComponent(topic)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-full border border-border/60 bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                      >
                        {topic} →
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Think About */}
              {insight.thinkAbout && (
                <blockquote className="border-l-2 border-amber-500/40 pl-3 italic text-sm text-muted-foreground">
                  {insight.thinkAbout}
                </blockquote>
              )}

              <p className="text-[10px] text-muted-foreground/50 font-mono">
                Generated {new Date(insight.generatedAt).toLocaleTimeString()} · cached 2h
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
