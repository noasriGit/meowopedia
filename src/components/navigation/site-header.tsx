"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { SITE } from "@/config/site";
import { CATEGORY_SLUGS, CATEGORIES } from "@/config/taxonomy";
import { STATIC_PAGE_NAV, staticPagePath } from "@/config/static-pages";
import { Button } from "@/components/ui/button";
import { GlobalSearch, MobileSearchTrigger } from "@/components/navigation/global-search";

const primaryNav = [
  { label: "Breeds", href: "/breeds" },
  { label: "Health", href: "/health" },
  { label: "Behavior", href: "/behavior" },
  { label: "Nutrition", href: "/nutrition" },
  { label: "Foods", href: "/foods" },
  { label: "Plants", href: "/plants" },
  { label: "Guides", href: "/guides" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [inHero, setInHero] = useState(isHome);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const mobileNavId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const firstFocusable = mobileNavRef.current?.querySelector<HTMLElement>(
      'a, button, input, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!isHome) {
      setInHero(false);
      return;
    }

    const hero = document.getElementById("home-hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInHero(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-64px 0px 0px 0px" }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  const useHeroStyle = isHome && inHero;

  const themeLabel =
    resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <header
      className={
        useHeroStyle
          ? "sticky top-0 z-50 border-b border-white/15 bg-black/25 shadow-sm shadow-black/10 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow] duration-300"
          : "sticky top-0 z-50 border-b border-border bg-background shadow-sm backdrop-blur-none transition-[background-color,border-color,box-shadow] duration-300"
      }
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span
            className={
              useHeroStyle
                ? "text-xl font-bold tracking-tight text-white"
                : "text-xl font-bold tracking-tight"
            }
          >
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                useHeroStyle
                  ? "rounded-md px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  : "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={useHeroStyle ? "ml-auto hidden md:block [&_input]:border-white/30 [&_input]:bg-black/30 [&_input]:text-white [&_input]:placeholder:text-white/50 [&_svg]:text-white/60" : "ml-auto hidden md:block"}>
          <GlobalSearch />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={themeLabel}
            className={useHeroStyle ? "hidden text-white hover:bg-white/10 hover:text-white sm:inline-flex" : "hidden sm:inline-flex"}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
          </Button>

          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            className={useHeroStyle ? "text-white hover:bg-white/10 hover:text-white lg:hidden" : "lg:hidden"}
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={mobileNavId}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div
          ref={mobileNavRef}
          id={mobileNavId}
          className={
            useHeroStyle
              ? "border-t border-white/15 bg-black/30 backdrop-blur-xl backdrop-saturate-150 lg:hidden"
              : "border-t border-border bg-background lg:hidden"
          }
        >
          <div className="space-y-4 px-4 py-4">
            <MobileSearchTrigger
              className={
                useHeroStyle
                  ? "w-full justify-center border-white/20 text-white/80"
                  : "w-full justify-center"
              }
            />
            <nav aria-label="Mobile primary" className="grid grid-cols-2 gap-2">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={
                    useHeroStyle
                      ? "rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white"
                      : "rounded-lg border border-border px-3 py-2 text-sm font-medium"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <details
              className={
                useHeroStyle
                  ? "rounded-lg border border-white/20 p-3 text-white"
                  : "rounded-lg border border-border p-3"
              }
            >
              <summary className="cursor-pointer text-sm font-medium">
                All Categories
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {CATEGORY_SLUGS.map((slug) => (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    onClick={closeMobileMenu}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {CATEGORIES[slug].title}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-lg font-bold">{SITE.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">{SITE.tagline}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Explore</h2>
            <ul className="mt-3 space-y-2">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Categories</h2>
            <ul className="mt-3 space-y-2">
              {CATEGORY_SLUGS.slice(0, 8).map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/${slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {CATEGORIES[slug].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Tools</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground">
                  Compare
                </Link>
              </li>
              <li>
                <Link href="/calculators" className="text-sm text-muted-foreground hover:text-foreground">
                  Calculators
                </Link>
              </li>
              <li>
                <Link href="/checklists" className="text-sm text-muted-foreground hover:text-foreground">
                  Checklists
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold">About</h2>
            <ul className="mt-3 space-y-2">
              {STATIC_PAGE_NAV.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={staticPagePath(item.slug)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-6 lg:hidden">
          {STATIC_PAGE_NAV.map((item) => (
            <Link
              key={item.slug}
              href={staticPagePath(item.slug)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <p className="mt-6 border-t border-border pt-6 text-xs text-muted-foreground lg:mt-10">
          © {new Date().getFullYear()} {SITE.name}. The definitive encyclopedia of cats.
        </p>
      </div>
    </footer>
  );
}
