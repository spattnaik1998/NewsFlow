"use client";

import { use } from "react";
import { useArticle } from "@/hooks/use-article";
import { ArticleHero } from "@/components/article/article-hero";
import { AISummaryPanel } from "@/components/article/ai-summary-panel";
import { RelatedArticles } from "@/components/article/related-articles";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { SearchPalette } from "@/components/search/search-palette";
import { AlertCircle } from "lucide-react";

export default function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { article, relatedArticles, isLoading, isError } = useArticle(id);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header onSearchOpen={() => setSearchOpen(true)} />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 rounded" />
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-5/6 rounded" />
              <Skeleton className="h-32 w-full rounded-xl mt-6" />
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-6">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Article not found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This article may have been removed or the link is invalid.
                </p>
              </div>
            </div>
          )}

          {article && !isLoading && (
            <>
              <ArticleHero article={article} />

              <div className="grid gap-6 lg:grid-cols-3 mt-6">
                <div className="lg:col-span-2 space-y-6">
                  <RelatedArticles articles={relatedArticles} />
                </div>
                <div className="lg:col-span-1">
                  <AISummaryPanel articleId={article.id} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
