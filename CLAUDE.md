# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # start dev server at localhost:3000
npm run build  # production build (also runs type checking)
npm run lint   # ESLint via next lint
npm run start  # serve production build
```

There is no test suite. Type safety is enforced at build time via `npm run build`.

## Required Environment Variables

Create `.env.local` before running:
```
OPENAI_API_KEY=...    # gpt-4o-mini for summarization + categorization
SERPER_API_KEY=...    # Google News search
TAVILY_API_KEY=...    # deep research search (on-demand only)
```

## Architecture

### Data Flow

All data originates in `src/lib/fetchers/` — one file per source. `fetchAllSources()` in `src/lib/fetchers/index.ts` runs all 8 fetchers concurrently via `Promise.allSettled`, scores each article with `scoreArticle()`, deduplicates with `deduplicateArticles()`, and caches the result for 5 minutes. The `/api/feed` route calls `fetchAllSources()` and applies filtering, sorting, and pagination on top.

### Caching

`src/lib/cache/memory-cache.ts` exports a singleton `cache` attached to `global.__memoryCache` so it survives Next.js hot-reload. All TTLs live in `src/lib/constants.ts` under `TTL`. Both source fetchers and AI summaries read from and write to this same cache instance.

### Deduplication & Scoring

`src/lib/deduplication.ts` has two exports:
- `deduplicateArticles()` — SHA-256 hash of normalized URL + title; on collision keeps highest-scored article
- `scoreArticle()` — normalizes raw scores per-source (GitHub stars vs HN points have very different scales), adds source-quality bonus and recency decay into a 0–100 range

### AI Pipeline

`src/lib/ai/categorizer.ts` runs a keyword scan first (defined in `KEYWORD_CATEGORIES` in constants.ts), covering ~75% of articles for free. Only uncategorized articles are sent to `gpt-4o-mini` in batches of 20. `src/lib/ai/summarizer.ts` generates per-article summaries lazily (only when requested via `/api/summarize`) and caches them for 1 hour. Only `title + description` (max 300 chars) is sent — never full article content.

### Rate Limiting

`src/lib/rate-limit.ts` provides sliding-window rate limiting keyed by IP. Limits are: feed 60/min, search 20/min, summarize 10/min, categorize 5/min.

### Client State

`src/app/page.tsx` is a client component that owns all filter state. It uses SWR via `src/hooks/use-feed.ts`. Article detail (`src/app/article/[id]/page.tsx`) and category pages (`src/app/category/[slug]/page.tsx`) are separate routes.

### Key Types

All shared TypeScript interfaces are in `src/lib/types.ts`: `Article`, `AISummary`, `FeedResponse`, `FeedFilters`, `SourceStats`, `SourceHealth`. `Category` and `Source` are union string literal types defined there.

## Design System

"Editorial Terminal" aesthetic: amber (`#f59e0b`) accents, slate dark mode, monospace metadata. Dark mode uses `next-themes` with `class` strategy (add `dark` class to `<html>`). shadcn/ui components live in `src/components/ui/`; custom components are organized under `src/components/{feed,article,search,layout,shared}/`.

## Adding a New Source Fetcher

1. Create `src/lib/fetchers/your-source.ts` — must return `{ articles: Article[], stats: SourceStats }`
2. Add the source string literal to the `Source` type in `src/lib/types.ts`
3. Add a label to `SOURCE_LABELS` in `src/lib/constants.ts`
4. Add a `sourceMax` entry in `scoreArticle()` in `src/lib/deduplication.ts`
5. Import and add to `Promise.allSettled([...])` in `src/lib/fetchers/index.ts`
