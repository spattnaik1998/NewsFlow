"use client";

import { useState, useEffect, useCallback } from "react";
import type { SearchResponse } from "@/lib/types";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeep, setIsDeep] = useState(false);

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const search = useCallback(async (q: string, deep = false) => {
    if (!q || q.trim().length < 2) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim() });
      if (deep) params.set("deep", "true");
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data: SearchResponse = await res.json();
        setResults(data);
      }
    } catch {
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      search(debouncedQuery, isDeep);
    } else {
      setResults(null);
    }
  }, [debouncedQuery, isDeep, search]);

  const deepSearch = useCallback(() => {
    setIsDeep(true);
    search(debouncedQuery, true);
  }, [debouncedQuery, search]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    isDeep,
    setIsDeep,
    deepSearch,
    clearResults: () => { setResults(null); setQuery(""); setDebouncedQuery(""); setIsDeep(false); },
  };
}
