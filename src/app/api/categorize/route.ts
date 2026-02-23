import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import { categorizeArticles } from "@/lib/ai/categorizer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleIds } = body;

    if (!Array.isArray(articleIds)) {
      return NextResponse.json({ error: "articleIds array is required" }, { status: 400 });
    }

    const feed = await fetchAllSources();
    const articles = feed.articles.filter((a) => articleIds.includes(a.id));

    if (articles.length === 0) {
      return NextResponse.json({ categories: {} });
    }

    const categoryMap = await categorizeArticles(articles);
    const categories: Record<string, string> = {};
    for (const [id, cat] of categoryMap.entries()) {
      categories[id] = cat;
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[/api/categorize]", error);
    return NextResponse.json({ error: "Failed to categorize" }, { status: 500 });
  }
}
