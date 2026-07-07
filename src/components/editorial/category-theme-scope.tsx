import type { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  categoryThemeClass,
  getCategoryTheme,
} from "@/config/category-themes";
import type { CategorySlug } from "@/config/taxonomy";

interface CategoryThemeScopeProps {
  category: CategorySlug;
  children: ReactNode;
  className?: string;
}

export function CategoryThemeScope({
  category,
  children,
  className,
}: CategoryThemeScopeProps) {
  const theme = getCategoryTheme(category);

  return (
    <div
      className={cn("editorial-scope", categoryThemeClass(category), className)}
      style={
        {
          "--theme-accent": theme.accent,
          "--theme-accent-muted": theme.accentMuted,
          "--theme-accent-foreground": theme.accentForeground,
          "--theme-hero-gradient": theme.heroGradient,
          "--theme-mesh-a": theme.meshA,
          "--theme-mesh-b": theme.meshB,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
