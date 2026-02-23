"use client";

import { use, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ArticleGrid } from "@/components/feed/article-grid";
import { FeedToolbar } from "@/components/feed/feed-toolbar";
import { FeedSkeleton } from "@/components/feed/feed-skeleton";
import { SearchPalette } from "@/components/search/search-palette";
import { useFeed } from "@/hooks/use-feed";
import { CATEGORIES } from "@/lib/constants";
import type { Category, FeedFilters } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const category = slug as Category;
  const meta = CATEGORIES[category];

  const [filters, setFilters] = useState<FeedFilters>({ sortBy: "score" });
  const [page, setPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);

  const { articles, totalCount, sourceStats, isLoading, hasMore, refresh } = useFeed({
    ...filters,
    category,
    page,
  });

  function updateFilters(partial: Partial<FeedFilters>) {
    setFilters((f) => ({ ...f, ...partial }));
    setPage(1);
  }

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Category not found</p>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header onSearchOpen={() => setSearchOpen(true)} />

        <div className="flex flex-1">
          <Sidebar sourceStats={sourceStats} />

          <main className="flex-1 min-w-0 p-4 md:p-6">
            {/* Category header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="text-2xl">{meta.icon}</span>
              <div>
                <h1 className="text-xl font-bold">{meta.label}</h1>
                <p className="text-xs text-muted-foreground">
                  {totalCount} articles
                </p>
              </div>
            </div>

            <FeedToolbar
              filters={filters}
              totalCount={totalCount}
              isLoading={isLoading}
              onFiltersChange={updateFilters}
              onRefresh={refresh}
            />

            {isLoading && articles.length === 0 ? (
              <FeedSkeleton count={6} />
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">{meta.icon}</span>
                <p className="text-lg font-medium mb-2">No {meta.label} articles yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Check back soon as we aggregate new content.
                </p>
                <Link href="/">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    All articles
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <ArticleGrid articles={articles} />
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

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
