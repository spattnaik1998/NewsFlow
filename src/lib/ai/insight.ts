import type { Article, ArticleInsight } from "../types";
import { cache } from "../cache/memory-cache";
import { TTL } from "../constants";
import { openai } from "./openai-client";
import { truncate } from "../utils";

function insightKey(articleId: string): string {
  return `ai:insight:${articleId}`;
}

export async function getInsight(article: Article): Promise<ArticleInsight> {
  const cacheKey = insightKey(article.id);
  const cached = cache.get<ArticleInsight>(cacheKey);
  if (cached) return cached;

  const prompt = `You are a senior engineer and educator helping a developer understand the deeper meaning of a tech article. Be concise and practical.

Title: ${article.title}
Description: ${truncate(article.description, 300)}

Respond with this exact JSON:
{
  "soWhat": "One sentence: the practical implication for a developer (what should they do or think about?)",
  "firstPrinciple": "The core underlying concept or idea this story exemplifies (1-2 sentences)",
  "learnMore": ["Topic 1 to explore", "Topic 2 to explore"],
  "thinkAbout": "A thought-provoking question to sit with (1 sentence)"
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 400,
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);

  const insight: ArticleInsight = {
    soWhat: parsed.soWhat ?? "",
    firstPrinciple: parsed.firstPrinciple ?? "",
    learnMore: Array.isArray(parsed.learnMore) ? parsed.learnMore.slice(0, 2) : [],
    thinkAbout: parsed.thinkAbout ?? "",
    generatedAt: new Date().toISOString(),
  };

  cache.set(cacheKey, insight, TTL.AI_INSIGHT);
  return insight;
}
