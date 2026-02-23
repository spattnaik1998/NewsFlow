import type { Article, Category } from "../types";
import { inferCategoryByKeyword } from "../utils";
import { openai } from "./openai-client";

const VALID_CATEGORIES: Category[] = [
  "ai-ml", "web-dev", "security", "hardware", "open-source",
  "cloud-devops", "mobile", "research", "programming", "business-tech",
];

export async function categorizeArticles(articles: Article[]): Promise<Map<string, Category>> {
  const results = new Map<string, Category>();
  const needsAI: Article[] = [];

  // Keyword scan first (free, instant)
  for (const article of articles) {
    const category = inferCategoryByKeyword(article.title, article.description);
    if (category) {
      results.set(article.id, category);
    } else {
      needsAI.push(article);
    }
  }

  if (needsAI.length === 0) return results;

  // AI fallback for uncategorized (batched)
  const batchSize = 20;
  for (let i = 0; i < needsAI.length; i += batchSize) {
    const batch = needsAI.slice(i, i + batchSize);
    const items = batch.map((a, idx) => ({ index: idx, title: a.title }));

    const prompt = `Categorize these tech articles into one of: ${VALID_CATEGORIES.join(", ")}.

Articles:
${JSON.stringify(items)}

Return JSON: {"results": [{"index": 0, "category": "ai-ml"}, ...]}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0,
        max_tokens: 500,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw);

      for (const r of parsed.results ?? []) {
        const article = batch[r.index];
        if (!article) continue;
        const cat = VALID_CATEGORIES.includes(r.category) ? r.category : "uncategorized";
        results.set(article.id, cat as Category);
      }
    } catch {
      // Default uncategorized for failed batches
      for (const article of batch) {
        results.set(article.id, "uncategorized");
      }
    }
  }

  return results;
}
