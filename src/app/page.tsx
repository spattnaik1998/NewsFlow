"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ArticleGrid } from "@/components/feed/article-grid";
import { FeedToolbar } from "@/components/feed/feed-toolbar";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { SearchPalette } from "@/components/search/search-palette";
import { SpeedReadModal } from "@/components/feed/speed-read-modal";
import { useFeed } from "@/hooks/use-feed";
import { useReadingList } from "@/hooks/use-reading-list";
import type { FeedFilters } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function HomePage() {
  const [filters, setFilters] = useState<FeedFilters>({ sortBy: "score" });
  const [page, setPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [blitzOpen, setBlitzOpen] = useState(false);
  const { savedIds, toggle: toggleSave } = useReadingList();

  const { articles, totalCount, sourceStats, isLoading, hasMore, refresh } = useFeed({
    ...filters,
    page,
  });

  function updateFilters(partial: Partial<FeedFilters>) {
    setFilters((f) => ({ ...f, ...partial }));
    setPage(1);
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header onSearchOpen={() => setSearchOpen(true)} />

        <div className="flex flex-1">
          <Sidebar sourceStats={sourceStats} />

          <main className="flex-1 min-w-0 p-4 md:p-6">
            <FeedToolbar
              filters={filters}
              totalCount={totalCount}
              isLoading={isLoading}
              onFiltersChange={updateFilters}
              onRefresh={refresh}
              onBlitz={() => setBlitzOpen(true)}
            />

            {isLoading && articles.length === 0 ? (
              <FeedSkeleton count={9} />
            ) : (
              <>
                <ArticleGrid articles={articles} savedIds={savedIds} onSave={toggleSave} />

                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      className="gap-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <SearchPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {blitzOpen && (
        <SpeedReadModal
          articles={articles}
          savedIds={savedIds}
          onSave={toggleSave}
          onClose={() => setBlitzOpen(false)}
        />
      )}
    </>
  );
}
