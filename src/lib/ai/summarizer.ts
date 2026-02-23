import type { Article, AISummary, Sentiment } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL } from "../constants";
import { openai } from "./openai-client";
import { truncate } from "../utils";

function summaryKey(articleId: string): string {
  return `ai:summary:${articleId}`;
}

export async function getSummary(article: Article): Promise<AISummary> {
  const cacheKey = summaryKey(article.id);
  const cached = cache.get<AISummary>(cacheKey);
  if (cached) return cached;

  const prompt = `You are a tech news summarizer. Analyze this article and respond with JSON only.

Title: ${article.title}
Description: ${truncate(article.description, 300)}

Respond with this exact JSON:
{
  "tldr": "One sentence summary (max 120 chars)",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "sentiment": "positive" | "negative" | "neutral",
  "technicalDepth": "beginner" | "intermediate" | "advanced"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 300,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  const summary: AISummary = {
    articleId: article.id,
    tldr: parsed.tldr ?? "No summary available",
    keyPoints: parsed.keyPoints ?? [],
    sentiment: (parsed.sentiment ?? "neutral") as Sentiment,
    technicalDepth: parsed.technicalDepth ?? "intermediate",
    generatedAt: new Date().toISOString(),
  };

  cache.set(cacheKey, summary, TTL.AI_SUMMARY);
  return summary;
}

export async function batchSummarize(articles: Article[]): Promise<Map<string, AISummary>> {
  const results = new Map<string, AISummary>();
  const uncached: Article[] = [];

  // Check cache first
  for (const article of articles) {
    const cached = cache.get<AISummary>(summaryKey(article.id));
    if (cached) {
      results.set(article.id, cached);
    } else {
      uncached.push(article);
    }
  }

  if (uncached.length === 0) return results;

  // Batch into groups of 10
  const batchSize = 10;
  for (let i = 0; i < uncached.length; i += batchSize) {
    const batch = uncached.slice(i, i + batchSize);
    const articlesJson = batch.map((a, idx) => ({
      index: idx,
      title: a.title,
      description: truncate(a.description, 300),
    }));

    const prompt = `Summarize these ${batch.length} tech articles. Return a JSON array of objects.

Articles:
${JSON.stringify(articlesJson, null, 2)}

Return JSON array (one per article, same order):
[{"index":0,"tldr":"...","keyPoints":["..."],"sentiment":"positive|negative|neutral","technicalDepth":"beginner|intermediate|advanced"}]`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw);
      const summaries: Array<{ index: number; tldr: string; keyPoints: string[]; sentiment: string; technicalDepth: string }> = parsed.summaries ?? parsed;

      if (Array.isArray(summaries)) {
        for (const s of summaries) {
          const article = batch[s.index];
          if (!article) continue;
          const summary: AISummary = {
            articleId: article.id,
            tldr: s.tldr ?? "",
            keyPoints: s.keyPoints ?? [],
            sentiment: (s.sentiment ?? "neutral") as Sentiment,
            technicalDepth: (s.technicalDepth ?? "intermediate") as AISummary["technicalDepth"],
            generatedAt: new Date().toISOString(),
          };
          cache.set(summaryKey(article.id), summary, TTL.AI_SUMMARY);
          results.set(article.id, summary);
        }
      }
    } catch {
      // Fail silently for batch - individual summaries will still work
    }
  }

  return results;
}
