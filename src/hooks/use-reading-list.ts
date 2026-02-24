"use client";

import { useState, useEffect, useCallback } from "react";
import type { Article } from "@/lib/types";

const STORAGE_KEY = "newsflow:reading-list";

export function useReadingList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setArticles(JSON.parse(raw));
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Article[]) => {
    setArticles(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, []);

  const save = useCallback(
    (article: Article) => {
      setArticles((prev) => {
        if (prev.some((a) => a.id === article.id)) return prev;
        const next = [article, ...prev];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const remove = useCallback(
    (id: string) => {
      setArticles((prev) => {
        const next = prev.filter((a) => a.id !== id);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const isSaved = useCallback(
    (id: string) => articles.some((a) => a.id === id),
    [articles]
  );

  const savedIds = new Set(articles.map((a) => a.id));

  const toggle = useCallback(
    (article: Article) => {
      if (articles.some((a) => a.id === article.id)) {
        remove(article.id);
      } else {
        save(article);
      }
    },
    [articles, save, remove]
  );

  return { articles, savedIds, hydrated, save, remove, toggle, isSaved, persist };
}
