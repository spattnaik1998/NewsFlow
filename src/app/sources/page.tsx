"use client";

import { useState } from "react";
import useSWR from "swr";
import { Header } from "@/components/layout/header";
import { SearchPalette } from "@/components/search/search-palette";
import { SourceBadge } from "@/components/shared/source-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, XCircle, Clock, FileText, Zap } from "lucide-react";
import type { SourceHealth } from "@/lib/types";
import type { Source } from "@/lib/types";

interface StatusResponse {
  sources: SourceHealth[];
  totalArticles: number;
  generatedAt: string;
  cached: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_CONFIG = {
  healthy: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Healthy" },
  degraded: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Degraded" },
  down: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Down" },
};

export default function SourcesPage() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { data, isLoading } = useSWR<StatusResponse>("/api/sources/status", fetcher, {
    refreshInterval: 30_000,
  });

  const healthy = data?.sources.filter((s) => s.status === "healthy").length ?? 0;
  const total = data?.sources.length ?? 0;

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header onSearchOpen={() => setSearchOpen(true)} />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-1">
              <Zap className="h-6 w-6 text-amber-500" />
              Source Health
            </h1>
            <p className="text-sm text-muted-foreground">
              Real-time status of all 8 news aggregation sources
            </p>
          </div>

          {/* Summary bar */}
          {data && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <p className="text-2xl font-bold text-emerald-500">{healthy}</p>
                <p className="text-xs text-muted-foreground mt-1">Sources healthy</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <p className="text-2xl font-bold">{data.totalArticles}</p>
                <p className="text-xs text-muted-foreground mt-1">Total articles</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card p-4 text-center">
                <p className={cn("text-2xl font-bold", healthy === total ? "text-emerald-500" : "text-amber-500")}>
                  {total > 0 ? Math.round((healthy / total) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Uptime</p>
              </div>
            </div>
          )}

          {/* Sources list */}
          <div className="space-y-3">
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-card p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}

            {data?.sources.map((source) => {
              const cfg = STATUS_CONFIG[source.status];
              const StatusIcon = cfg.icon;

              return (
                <div
                  key={source.source}
                  className="rounded-xl border border-border/60 bg-card p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <SourceBadge source={source.source as Source} />
                      <h3 className="font-medium text-sm">{source.name}</h3>
                    </div>
                    <span
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                        cfg.bg,
                        cfg.color
                      )}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {source.articleCount} articles
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      {source.avgLatencyMs > 0 ? `${source.avgLatencyMs}ms` : "cached"}
                    </span>
                    {source.lastFetchAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(source.lastFetchAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  {source.errors.length > 0 && (
                    <div className="mt-2 rounded bg-destructive/5 border border-destructive/10 px-3 py-2">
                      {source.errors.map((e, i) => (
                        <p key={i} className="text-xs text-destructive font-mono">
                          {e}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {data && (
            <p className="mt-6 text-center text-[11px] text-muted-foreground/50 font-mono">
              Last updated: {new Date(data.generatedAt).toLocaleString()} ·{" "}
              {data.cached ? "cached" : "live"} · auto-refreshes every 30s
            </p>
          )}
        </main>
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
