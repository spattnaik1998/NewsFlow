import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createHash } from "crypto";
import type { Category } from "./types";
import { KEYWORD_CATEGORIES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeContentHash(url: string, title: string): string {
  const normalized = normalizeUrl(url) + "|" + normalizeTitle(title);
  return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove tracking params
    const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "source"];
    trackingParams.forEach((p) => parsed.searchParams.delete(p));
    return parsed.origin + parsed.pathname.replace(/\/$/, "").toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().trim().replace(/\s+/g, " ").replace(/[^\w\s]/g, "");
}

export function inferCategoryByKeyword(title: string, description: string): Category | null {
  const text = (title + " " + description).toLowerCase();

  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    if (category === "uncategorized") continue;
    if (keywords.some((kw) => text.includes(kw))) {
      return category as Category;
    }
  }
  return null;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(source: string, url: string): string {
  return `${source}-${computeContentHash(url, url)}`;
}
