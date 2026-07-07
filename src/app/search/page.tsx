import Link from "next/link";
import { searchArticles } from "@/lib/search/index";
import { buildMetadata } from "@/lib/seo/metadata";
import { GlobalSearch } from "@/components/navigation/global-search";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = buildMetadata({
  title: "Search",
  description: "Search the Meowopedia cat encyclopedia — breeds, health, behavior, nutrition, and more.",
  path: "/search",
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.length >= 2 ? searchArticles(q, 24) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Search Meowopedia</h1>
      <p className="mt-2 text-muted-foreground">
        Search across breeds, diseases, foods, plants, behavior, and the full
        knowledge graph. Supports synonyms, aliases, and common misspellings.
      </p>

      <div className="mt-8">
        <GlobalSearch />
      </div>

      {q && (
        <section className="mt-10">
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
          <ul className="mt-4 space-y-3">
            {results.map((result) => (
              <li key={result.id}>
                <Link href={result.url}>
                  <Card className="transition-colors hover:border-primary/40">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{result.title}</h2>
                        <Badge variant="outline" className="capitalize">
                          {result.entityType.replace(/-/g, " ")}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {result.summary}
                      </p>
                      {result.matchedAlias && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Matched alias: {result.matchedAlias}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
