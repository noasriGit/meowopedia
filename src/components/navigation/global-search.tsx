"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/search/index";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const listboxId = useId();
  const statusId = useId();

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&limit=8`
      );
      const data = await response.json();
      setResults(data.results ?? []);
      setActiveIndex(-1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchResults]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showResults = isOpen && query.length >= 2;
  const optionCount = results.length;

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showResults) {
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) =>
          index < optionCount - 1 ? index + 1 : index
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => (index > 0 ? index - 1 : -1));
        break;
      case "Enter":
        if (activeIndex >= 0 && results[activeIndex]) {
          event.preventDefault();
          window.location.href = results[activeIndex].url;
          setIsOpen(false);
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  }

  const statusMessage = isLoading
    ? "Searching…"
    : results.length
      ? `${results.length} result${results.length !== 1 ? "s" : ""} available`
      : `No results for "${query}"`;

  return (
    <div ref={containerRef} className="relative w-full max-w-md" role="search">
      <label htmlFor="global-search-input" className="sr-only">
        Search Meowopedia
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          id="global-search-input"
          type="search"
          placeholder="Search the encyclopedia… (⌘K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          className="pl-9 pr-9"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-describedby={showResults ? statusId : undefined}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {showResults && (
        <>
          <p id={statusId} className="sr-only" aria-live="polite">
            {statusMessage}
          </p>
          <div
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
          >
            {isLoading ? (
              <p className="p-4 text-sm text-muted-foreground" role="status">
                Searching…
              </p>
            ) : results.length ? (
              <ul className="max-h-96 overflow-y-auto py-2">
                {results.map((result, index) => (
                  <li
                    key={result.id}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                  >
                    <Link
                      href={result.url}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-4 py-3 transition-colors hover:bg-accent",
                        activeIndex === index && "bg-accent"
                      )}
                    >
                      <p className="font-medium">{result.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {result.summary}
                      </p>
                      <p className="mt-1 text-xs capitalize text-muted-foreground">
                        {result.category.replace(/-/g, " ")} ·{" "}
                        {result.entityType.replace(/-/g, " ")}
                        {result.matchedAlias && ` · aka ${result.matchedAlias}`}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-sm text-muted-foreground" role="status">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}
            <div className="border-t border-border px-4 py-2">
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-primary hover:underline"
              >
                View all search results for &ldquo;{query}&rdquo;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function MobileSearchTrigger({
  className,
}: {
  className?: string;
}) {
  return (
    <Link
      href="/search"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground",
        className
      )}
    >
      <Search className="h-4 w-4" aria-hidden="true" />
      Search encyclopedia
    </Link>
  );
}
