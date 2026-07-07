import { NextResponse } from "next/server";
import { searchArticles } from "@/lib/search/index";
import { SITE } from "@/config/site";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Number(searchParams.get("limit") ?? SITE.search.maxResults);

  if (q.length < SITE.search.minQueryLength) {
    return NextResponse.json({ results: [], query: q });
  }

  const results = searchArticles(q, limit);

  return NextResponse.json({
    query: q,
    count: results.length,
    results,
  });
}
