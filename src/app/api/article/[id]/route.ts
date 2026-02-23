import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import type { ArticleResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feed = await fetchAllSources();
    const article = feed.articles.find((a) => a.id === params.id);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Get related articles (same category, different source)
    const related = feed.articles
      .filter(
        (a) =>
          a.id !== article.id &&
          (a.category === article.category || a.source === article.source)
      )
      .slice(0, 6);

    const response: ArticleResponse = {
      article,
      relatedArticles: related,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[/api/article]", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}
