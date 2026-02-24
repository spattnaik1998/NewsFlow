"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ArticleGrid } from "@/components/feed/article-grid";
import { SearchPalette } from "@/components/search/search-palette";
import { useReadingList } from "@/hooks/use-reading-list";
import { useState } from "react";
import { BookmarkX } from "lucide-react";

export default function ReadingListPage() {
  const { articles, savedIds, toggle } = useReadingList();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header onSearchOpen={() => setSearchOpen(true)} />

        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 min-w-0 p-4 md:p-6">
            <div className="mb-6 pb-4 border-b border-border/60">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <BookmarkX className="h-5 w-5 text-amber-500" />
                Reading List
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {articles.length} saved {articles.length === 1 ? "article" : "articles"}
              </p>
            </div>

            {articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <BookmarkX className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium mb-2">No saved articles</p>
                <p className="text-sm text-muted-foreground">
                  Bookmark articles from the feed to read them later.
                </p>
              </div>
            ) : (
              <ArticleGrid
                articles={articles}
                savedIds={savedIds}
                onSave={toggle}
              />
            )}
          </main>
        </div>
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
