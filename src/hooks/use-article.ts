"use client";

import useSWR from "swr";
import type { ArticleResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useArticle(id: string | null) {
  const { data, error, isLoading } = useSWR<ArticleResponse>(
    id ? `/api/article/${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    article: data?.article,
    relatedArticles: data?.relatedArticles ?? [],
    isLoading,
    isError: !!error,
  };
}
