import { NextRequest, NextResponse } from "next/server";
import { fetchAllSources } from "@/lib/fetchers";
import { getSummary } from "@/lib/ai/summarizer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId } = body;

    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    const feed = await fetchAllSources();
    const article = feed.articles.find((a) => a.id === articleId);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const summary = await getSummary(article);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("[/api/summarize]", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
