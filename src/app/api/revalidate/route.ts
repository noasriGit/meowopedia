import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  invalidateContentCache,
} from "@/lib/content/loader";
import { invalidateLinkingCache } from "@/lib/knowledge-graph/linking";
import { invalidateSearchIndex } from "@/lib/search/index";

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  invalidateContentCache();
  invalidateLinkingCache();
  invalidateSearchIndex();
  revalidatePath("/", "layout");

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
  });
}
