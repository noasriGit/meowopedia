import { cn } from "@/lib/utils";
import { getCategoryTheme } from "@/config/category-themes";
import type { CategorySlug } from "@/config/taxonomy";

interface CategoryBadgeProps {
  category: CategorySlug;
  entityType?: string;
  className?: string;
}

export function CategoryBadge({
  category,
  entityType,
  className,
}: CategoryBadgeProps) {
  const theme = getCategoryTheme(category);
  const label = entityType
    ? entityType.replace(/-/g, " ")
    : theme.label;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
        className
      )}
      style={{
        backgroundColor: theme.accentMuted,
        color: theme.accentForeground,
      }}
    >
      {label}
    </span>
  );
}
