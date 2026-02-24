"use client";

import { LayoutGrid, Clock, TrendingUp, RefreshCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { FeedFilters } from "@/lib/types";

interface FeedToolbarProps {
  filters: FeedFilters;
  totalCount: number;
  isLoading?: boolean;
  onFiltersChange: (f: Partial<FeedFilters>) => void;
  onRefresh?: () => void;
  onBlitz?: () => void;
}

export function FeedToolbar({
  filters,
  totalCount,
  isLoading,
  onFiltersChange,
  onRefresh,
  onBlitz,
}: FeedToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 mb-4">
      <div className="flex items-center gap-1.5">
        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">{totalCount.toLocaleString()}</span>{" "}
          articles
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Sort toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => onFiltersChange({ sortBy: "score" })}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
              filters.sortBy === "score" || !filters.sortBy
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            <TrendingUp className="h-3 w-3" />
            Top
          </button>
          <button
            onClick={() => onFiltersChange({ sortBy: "date" })}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
              filters.sortBy === "date"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            <Clock className="h-3 w-3" />
            New
          </button>
        </div>

        {onBlitz && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/60"
            onClick={onBlitz}
          >
            <Zap className="h-3.5 w-3.5" />
            Blitz
          </Button>
        )}

        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh feed"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        )}
      </div>
    </div>
  );
}
