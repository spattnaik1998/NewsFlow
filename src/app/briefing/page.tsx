"use client";

import { useState } from "react";
import useSWR from "swr";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { SearchPalette } from "@/components/search/search-palette";
import { ArticleCard } from "@/components/feed/article-card";
import { Button } from "@/components/ui/button";
import { useReadingList } from "@/hooks/use-reading-list";
import { Newspaper, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import type { DailyBriefing, Article } from "@/lib/types";

interface BriefingWithArticles extends DailyBriefing {
  _articles?: Article[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BriefingPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { savedIds, toggle: toggleSave } = useReadingList();

  const { data, error, isLoading, mutate } = useSWR<BriefingWithArticles>("/api/briefing", fetcher, {
    revalidateOnFocus: false,
  });

  // Also fetch the full feed so we can map articleIds → Article objects
  const { data: feedData } = useSWR<{ articles: Article[] }>("/api/feed?pageSize=100", fetcher, {
    revalidateOnFocus: false,
  });

  const articleMap = new Map((feedData?.articles ?? []).map((a) => [a.id, a]));

  async function regenerate() {
    await fetch("/api/briefing", { method: "DELETE" });
    await mutate();
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header onSearchOpen={() => setSearchOpen(true)} />

        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 min-w-0 p-4 md:p-6">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <Newspaper className="h-5 w-5 text-amber-500" />
                <div>
                  <h1 className="text-xl font-bold">Daily Brief</h1>
                  <p className="text-xs text-muted-foreground font-mono">{today}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={regenerate}
                disabled={isLoading}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Your intelligence officer is writing today&apos;s briefing…
                </p>
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Failed to generate briefing.</p>
                <Button size="sm" onClick={() => mutate()}>Try again</Button>
              </div>
            )}

            {/* Briefing content */}
            {data && !isLoading && !error && (
              <div className="max-w-3xl space-y-10">
                {/* Headline + Lede */}
                <div>
                  <h2 className="text-3xl font-bold leading-tight mb-4">{data.headline}</h2>
                  <p className="text-base text-muted-foreground leading-relaxed">{data.lede}</p>
                </div>

                {/* Sections */}
                {data.sections.map((section, i) => {
                  const sectionArticles = section.articleIds
                    .map((id) => articleMap.get(id))
                    .filter((a): a is Article => Boolean(a))
                    .slice(0, 3);

                  return (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded px-2 py-0.5 uppercase tracking-wider">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-lg font-semibold">{section.theme}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                        {section.narrative}
                      </p>
                      {sectionArticles.length > 0 && (
                        <div className="pl-8 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                          {sectionArticles.map((article) => (
                            <ArticleCard
                              key={article.id}
                              article={article}
                              variant="compact"
                              isSaved={savedIds.has(article.id)}
                              onSave={toggleSave}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Watch For callout */}
                {data.watchFor && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                      Watch For
                    </p>
                    <p className="text-sm leading-relaxed">{data.watchFor}</p>
                  </div>
                )}

                <p className="text-[10px] font-mono text-muted-foreground/50">
                  Generated {new Date(data.generatedAt).toLocaleTimeString()} · cached 1h · powered by gpt-4o-mini
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
