import { CategoryGradient } from "@/components/editorial/category-gradient";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/config/taxonomy";

interface ArticleImageProps {
  articleId?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  category: CategorySlug;
  title: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fill?: boolean;
  aspectClassName?: string;
  showAttribution?: boolean;
}

/** Category-tinted gradient panel — replaces photographic featured images site-wide. */
export function ArticleImage({
  category,
  fill = false,
  className,
  aspectClassName = "aspect-[16/10]",
}: ArticleImageProps) {
  if (fill) {
    return (
      <CategoryGradient
        category={category}
        variant="hero"
        className={cn("h-full w-full", className)}
      />
    );
  }

  return (
    <CategoryGradient
      category={category}
      variant="card"
      className={cn(
        "w-full rounded-2xl",
        aspectClassName,
        className
      )}
    />
  );
}
