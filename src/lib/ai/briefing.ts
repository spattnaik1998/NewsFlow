import type { Article, DailyBriefing } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL } from "../constants";
import { openai } from "./openai-client";
import { truncate } from "../utils";

function todayKey(): string {
  const d = new Date();
  return `ai:briefing:${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function clearBriefingCache(): void {
  cache.delete(todayKey());
}

export async function generateBriefing(articles: Article[]): Promise<DailyBriefing> {
  const cacheKey = todayKey();
  const cached = cache.get<DailyBriefing>(cacheKey);
  if (cached) return cached;

  const top20 = articles.slice(0, 20);
  const articlesJson = top20.map((a) => ({
    id: a.id,
    title: a.title,
    description: truncate(a.description, 200),
    source: a.sourceName,
    category: a.category,
  }));

  const prompt = `You are an editorial intelligence officer writing a daily tech briefing. Given these ${top20.length} articles, synthesize a cohesive narrative briefing — not a bullet list, but a journalist's report.

Articles:
${JSON.stringify(articlesJson, null, 2)}

Respond with this exact JSON structure:
{
  "headline": "A punchy 8-12 word headline for today",
  "lede": "One compelling paragraph (2-3 sentences) capturing the biggest story of the day",
  "sections": [
    {
      "theme": "Theme name (3-5 words)",
      "narrative": "A 2-3 sentence narrative paragraph explaining what's happening in this theme and why it matters",
      "articleIds": ["id1", "id2", "id3"]
    }
  ],
  "watchFor": "One sentence about the emerging signal to watch in the coming days"
}

Use 3-5 sections. Only include articleIds that appear in the provided list. Do not hallucinate IDs.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.6,
    max_tokens: 1200,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  const briefing: DailyBriefing = {
    headline: parsed.headline ?? "Today in Tech",
    lede: parsed.lede ?? "",
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    watchFor: parsed.watchFor ?? "",
    generatedAt: new Date().toISOString(),
  };

  cache.set(cacheKey, briefing, TTL.AI_BRIEFING);
  return briefing;
}
