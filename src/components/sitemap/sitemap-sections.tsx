import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { SitemapCategoryGroup, SitemapEntry } from "@/lib/sitemap/types";

interface SitemapEntryListProps {
  entries: SitemapEntry[];
  showDescription?: boolean;
  showDate?: boolean;
}

export function SitemapEntryList({
  entries,
  showDescription = false,
  showDate = false,
}: SitemapEntryListProps) {
  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.id}>
          <Link
            href={entry.url}
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {entry.title}
          </Link>
          {showDescription && entry.description && (
            <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
          )}
          {showDate && (entry.publishedAt || entry.updatedAt) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(entry.publishedAt ?? entry.updatedAt)}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

interface SitemapCategorySectionProps {
  group: SitemapCategoryGroup;
}

export function SitemapCategorySection({ group }: SitemapCategorySectionProps) {
  return (
    <section aria-labelledby={`sitemap-category-${group.slug}`}>
      <h3
        id={`sitemap-category-${group.slug}`}
        className="text-lg font-semibold tracking-tight"
      >
        <Link
          href={group.hubUrl}
          className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {group.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
      <div className="mt-4">
        <SitemapEntryList entries={group.entries} />
      </div>
    </section>
  );
}

interface SitemapAlphabeticalIndexProps {
  groups: Record<string, SitemapEntry[]>;
}

export function SitemapAlphabeticalIndex({ groups }: SitemapAlphabeticalIndexProps) {
  const letters = Object.keys(groups);

  return (
    <div>
      <nav aria-label="Alphabetical index" className="mb-6">
        <ul className="flex flex-wrap gap-2">
          {letters.map((letter) => (
            <li key={letter}>
              <a
                href={`#sitemap-letter-${letter}`}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-border px-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {letter}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-8">
        {letters.map((letter) => (
          <section key={letter} id={`sitemap-letter-${letter}`} aria-labelledby={`sitemap-heading-${letter}`}>
            <h3
              id={`sitemap-heading-${letter}`}
              className="border-b border-border pb-2 text-lg font-semibold tracking-tight"
            >
              {letter}
            </h3>
            <div className="mt-4">
              <SitemapEntryList entries={groups[letter]} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
