"use client";

import useSWR from "swr";
import type { FeedResponse, FeedFilters } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function buildUrl(filters: FeedFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.source) params.set("source", filters.source);
  if (filters.search) params.set("search", filters.search);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  const qs = params.toString();
  return `/api/feed${qs ? `?${qs}` : ""}`;
}

export function useFeed(filters: FeedFilters = {}) {
  const url = buildUrl(filters);
  const { data, error, isLoading, mutate } = useSWR<FeedResponse>(url, fetcher, {
    refreshInterval: 2 * 60 * 1000, // re-fetch every 2 min (matches FULL_FEED TTL)
    revalidateOnFocus: true,        // refresh when user returns to the tab
    dedupingInterval: 30_000,
  });

  return {
    articles: data?.articles ?? [],
    totalCount: data?.totalCount ?? 0,
    sourceStats: data?.sourceStats ?? [],
    generatedAt: data?.generatedAt,
    cached: data?.cached ?? false,
    hasMore: data?.hasMore ?? false,
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
