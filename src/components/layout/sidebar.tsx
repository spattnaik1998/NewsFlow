"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIES, SOURCE_LABELS } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Category, Source, SourceStats } from "@/lib/types";

interface SidebarProps {
  sourceStats?: SourceStats[];
  className?: string;
}

const ORDERED_CATEGORIES = Object.entries(CATEGORIES).filter(
  ([key]) => key !== "uncategorized"
) as [Category, (typeof CATEGORIES)[Category]][];

const SOURCE_ORDER: Source[] = [
  "hacker-news", "reddit", "rss", "devto", "github", "arxiv", "serper", "tavily"
];

export function Sidebar({ sourceStats, className }: SidebarProps) {
  const pathname = usePathname();

  const statsMap = new Map(sourceStats?.map((s) => [s.source, s]) ?? []);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-56 flex-shrink-0 border-r border-border/60 bg-background/50",
        className
      )}
    >
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-4">
          {/* Main nav */}
          <div>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/"
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              All Articles
            </Link>
          </div>

          <Separator />

          {/* Categories */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Categories
            </p>
            <div className="space-y-0.5">
              {ORDERED_CATEGORIES.map(([slug, meta]) => {
                const isActive = pathname === `/category/${slug}`;
                return (
                  <Link
                    key={slug}
                    href={`/category/${slug}`}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="text-[13px] w-4 text-center">{meta.icon}</span>
                    <span className="truncate">{meta.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Sources */}
          <div>
            <div className="flex items-center justify-between px-3 mb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Sources
              </p>
              <Link
                href="/api/sources/status"
                target="_blank"
                className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground flex items-center gap-0.5"
              >
                <Activity className="h-2.5 w-2.5" />
                status
              </Link>
            </div>
            <div className="space-y-0.5">
              {SOURCE_ORDER.map((source) => {
                const stats = statsMap.get(source);
                const statusColor =
                  stats?.status === "error"
                    ? "bg-red-400"
                    : stats?.status === "cached"
                    ? "bg-amber-400"
                    : stats
                    ? "bg-emerald-400"
                    : "bg-muted-foreground/30";

                return (
                  <div
                    key={source}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm text-muted-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", statusColor)} />
                      <span className="text-xs truncate">{SOURCE_LABELS[source]}</span>
                    </div>
                    {stats && (
                      <span className="font-mono text-[10px] text-muted-foreground/60">
                        {stats.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      </ScrollArea>
    </aside>
  );
}
