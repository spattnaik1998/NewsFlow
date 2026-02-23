# NewsFlow — Tech News Aggregator

A production-quality tech news aggregator that pulls from **8 sources**, applies AI-powered summarization and categorization, and presents everything in a polished modern UI.

## Features

- **8 News Sources**: Hacker News, Reddit (6 subreddits), arXiv, Dev.to, GitHub Trending, RSS (TechCrunch, Ars Technica, The Verge, Wired), Google News (Serper), Deep Research (Tavily)
- **AI Summarization**: Lazy `gpt-4o-mini` summaries (TL;DR, key points, sentiment, technical depth) cached 1 hour
- **AI Categorization**: Keyword-scan first (~75% coverage) + AI fallback for 10 categories
- **Smart Dedup**: SHA-256 URL+title normalization, keeps highest-scored version
- **In-Memory Cache**: TTL-based singleton per source (3–30 min), 5 min full feed cache
- **Cmd+K Search**: Live local → Serper → Tavily deep search
- **Dark Mode**: `next-themes` system-default with class strategy
- **Source Health Dashboard**: `/sources` page with real-time status

## Quick Start

```bash
# 1. Add your API keys to .env.local:
#    OPENAI_API_KEY=...
#    SERPER_API_KEY=...
#    TAVILY_API_KEY=...

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Visit `http://localhost:3000`

## Verification

1. `npm run dev` → visit `localhost:3000` — articles load from multiple sources
2. Network tab → `/api/feed` returns `sourceStats` with all 8 sources
3. Click article → detail page; click "Generate AI Summary" → summary appears
4. Press `Cmd+K` → search palette opens; type a query → Serper results appear
5. Click a category in sidebar → feed filters correctly
6. Visit `/sources` → health dashboard with per-source status
7. Second feed load is near-instant (`X-Cache: HIT` header)
8. Toggle dark mode → UI switches cleanly

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/feed` | GET | Aggregated feed (`?category`, `?source`, `?search`, `?page`, `?sortBy`) |
| `/api/article/[id]` | GET | Single article + related articles |
| `/api/summarize` | POST | Generate AI summary `{ articleId }` |
| `/api/categorize` | POST | Batch categorize `{ articleIds: [] }` |
| `/api/search` | GET | Search `?q=query&deep=true` for Tavily |
| `/api/sources/status` | GET | Source health JSON |

## Architecture

```
src/
├── app/
│   ├── page.tsx                   # Main feed (client, SWR)
│   ├── article/[id]/page.tsx      # Article detail + AI summary
│   ├── category/[slug]/page.tsx   # Filtered category feed
│   ├── sources/page.tsx           # Source health dashboard
│   └── api/                       # Next.js API routes
├── lib/
│   ├── types.ts                   # All TypeScript interfaces
│   ├── constants.ts               # Categories, TTLs, RSS feeds, subreddits
│   ├── cache/memory-cache.ts      # TTL Map singleton (survives hot reload)
│   ├── fetchers/                  # 8 source fetchers + fetchAllSources()
│   ├── ai/                        # OpenAI singleton, batch summarizer, categorizer
│   ├── deduplication.ts           # SHA-256 URL+title dedup with score merge
│   └── rate-limit.ts              # Sliding window rate limiter
└── components/                    # shadcn/ui primitives + custom components
```

## Caching Strategy

| Source | TTL | Notes |
|---|---|---|
| Full feed | 5 min | Aggregated + deduped result |
| Hacker News | 3 min | Top 30 via Algolia |
| Reddit | 5 min | 6 subreddits, 1.1s delay |
| arXiv | 30 min | Rarely changes |
| Dev.to | 10 min | |
| GitHub | 15 min | Search API |
| RSS | 5 min | 4 feeds |
| Serper | 10 min | Per query key |
| Tavily | 20 min | Per query key |
| AI Summaries | 1 hour | Per article ID |

## Rate Limits

| Endpoint | Limit |
|---|---|
| `/api/feed` | 60 req/min per IP |
| `/api/summarize` | 10 req/min per IP |
| `/api/search` | 20 req/min per IP |
| `/api/categorize` | 5 req/min per IP |

## Cost Estimate

- Batch of 10 articles = 1 `gpt-4o-mini` call ≈ **$0.0003**
- Only `title + description` (max 300 chars) sent — not full content
- Summaries cached 1 hour — repeated clicks cost nothing
- Typical daily cost: **< $0.10** for moderate usage

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript, `src/` layout)
- **Styling**: Tailwind CSS + shadcn/ui (slate theme, CSS variables)
- **AI**: OpenAI `gpt-4o-mini`
- **Search**: Serper (Google News), Tavily (deep research)
- **State**: SWR for client data fetching
- **Cache**: In-memory TTL Map (no Redis needed)
