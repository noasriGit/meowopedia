import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/config/taxonomy";
import { getArticleHeroGradientStyles } from "@/lib/editorial/article-hero-gradient";
import { hashString } from "@/lib/editorial/presentation";

interface ArticleHeroGradientProps {
  articleId: string;
  category: CategorySlug;
  className?: string;
}

/** Unique per-article hero gradient with category-tinted mesh (light + dark). */
export function ArticleHeroGradient({
  articleId,
  category,
  className,
}: ArticleHeroGradientProps) {
  const styles = getArticleHeroGradientStyles(articleId, category);
  const seed = hashString(articleId);

  const meshAPosition =
    seed % 3 === 0
      ? "-left-20 top-0"
      : seed % 3 === 1
        ? "-right-32 top-4"
        : "right-1/4 -top-16";
  const meshBPosition =
    seed % 2 === 0 ? "-bottom-24 left-0" : "-bottom-16 right-1/4";
  const meshCPosition =
    seed % 2 === 0 ? "left-1/3 top-1/2" : "right-1/3 bottom-1/4";

  return (
    <div
      className={cn("article-hero-gradient absolute inset-0 overflow-hidden", className)}
      style={
        {
          "--article-hero-bg": styles.light,
          "--article-hero-bg-dark": styles.dark,
          "--article-mesh-a": styles.meshA,
          "--article-mesh-b": styles.meshB,
          "--article-mesh-c": styles.meshC,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <div
        className={cn(
          "pointer-events-none absolute h-80 w-80 rounded-full blur-3xl",
          meshAPosition
        )}
        style={{ background: "var(--article-mesh-a)" }}
      />
      <div
        className={cn(
          "pointer-events-none absolute h-64 w-64 rounded-full blur-3xl",
          meshBPosition
        )}
        style={{ background: "var(--article-mesh-b)" }}
      />
      <div
        className={cn(
          "pointer-events-none absolute h-48 w-48 rounded-full blur-3xl",
          meshCPosition
        )}
        style={{ background: "var(--article-mesh-c)" }}
      />
      <div className="editorial-grain pointer-events-none absolute inset-0 opacity-20 dark:opacity-10" />
    </div>
  );
}

interface HeroGradientShellProps {
  articleId: string;
  category: CategorySlug;
  className?: string;
  contentClassName?: string;
  minHeight?: string;
  scrim?: "strong" | "soft" | "none";
  children: ReactNode;
}

/** Shared hero backdrop — unique gradient + optional readability scrim. */
export function HeroGradientShell({
  articleId,
  category,
  className,
  contentClassName,
  minHeight = "min-h-[min(42vh,360px)]",
  scrim = "soft",
  children,
}: HeroGradientShellProps) {
  const scrimClass =
    scrim === "strong"
      ? "from-background via-background/70 to-transparent"
      : scrim === "soft"
        ? "from-background/95 via-background/45 to-transparent"
        : "";

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border",
        minHeight,
        className
      )}
    >
      <ArticleHeroGradient articleId={articleId} category={category} />
      {scrim !== "none" && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-t",
            scrimClass
          )}
          aria-hidden="true"
        />
      )}
      <div className={cn("relative z-10", contentClassName)}>{children}</div>
    </section>
  );
}
