"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/search/index";

export function HomeHeroSearch() {
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
    <div
      ref={containerRef}
      className="relative w-full max-w-xl"
      role="search"
    >
      <label htmlFor="home-hero-search-input" className="sr-only">
        Search Meowopedia
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id="home-hero-search-input"
          type="search"
          placeholder="Search breeds, health, behavior…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(-1);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          className="h-14 w-full rounded-none border border-border/80 bg-card/85 pl-12 pr-12 text-base text-foreground shadow-sm backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring/30 dark:bg-card/70 dark:focus:bg-card"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" aria-hidden="true" />
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
            className="absolute bottom-full left-0 z-50 mb-2 flex max-h-[min(18rem,50vh)] w-full flex-col overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-md lg:bottom-auto lg:left-full lg:top-0 lg:mb-0 lg:ml-3 lg:max-h-[min(24rem,70vh)] lg:w-96"
          >
            {isLoading ? (
              <p className="p-4 text-sm text-muted-foreground" role="status">
                Searching…
              </p>
            ) : results.length ? (
              <ul className="min-h-0 flex-1 overflow-y-auto py-2">
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
                      <p className="font-medium text-foreground">
                        {result.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {result.summary}
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
                className="text-sm font-medium text-foreground hover:underline"
              >
                View all results for &ldquo;{query}&rdquo;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
