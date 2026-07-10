import { cn } from "@/lib/utils";
import { getCategoryTheme } from "@/config/category-themes";
import type { CategorySlug } from "@/config/taxonomy";

interface CategoryGradientProps {
  category: CategorySlug;
  className?: string;
  /** hero = full-bleed with mesh; card = rounded panel; strip = compact card header */
  variant?: "hero" | "card" | "strip";
  showAccentBar?: boolean;
}

export function CategoryGradient({
  category,
  className,
  variant = "card",
  showAccentBar = true,
}: CategoryGradientProps) {
  const theme = getCategoryTheme(category);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: theme.heroGradient }}
      aria-hidden="true"
    >
      {variant === "hero" && (
        <>
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{ background: theme.meshA }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl"
            style={{ background: theme.meshB }}
          />
          <div className="editorial-grain pointer-events-none absolute inset-0 opacity-30 dark:opacity-15" />
        </>
      )}
      {showAccentBar && variant === "card" && (
        <div
          className="absolute inset-x-0 bottom-0 h-0.5"
          style={{ backgroundColor: theme.accent }}
        />
      )}
      {showAccentBar && variant === "strip" && (
        <div
          className="absolute inset-y-0 left-0 w-1 rounded-l-[inherit]"
          style={{ backgroundColor: theme.accent }}
        />
      )}
    </div>
  );
}

export function HomeGradient({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "editorial-home-gradient relative overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <div className="editorial-home-gradient__mesh-a pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full blur-3xl" />
      <div className="editorial-home-gradient__mesh-b pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full blur-3xl" />
      <div className="editorial-home-gradient__mesh-c pointer-events-none absolute right-1/3 top-1/2 h-48 w-48 rounded-full blur-3xl" />
      <div className="editorial-grain pointer-events-none absolute inset-0 opacity-20 dark:opacity-10" />
    </div>
  );
}
