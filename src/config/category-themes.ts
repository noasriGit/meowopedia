import type { CategorySlug } from "@/config/taxonomy";

export type CategoryThemeGroup =
  | "breeds"
  | "health"
  | "behavior"
  | "nutrition"
  | "history"
  | "wild"
  | "default";

export interface CategoryTheme {
  group: CategoryThemeGroup;
  label: string;
  /** CSS custom property values */
  accent: string;
  accentMuted: string;
  accentForeground: string;
  heroGradient: string;
  meshA: string;
  meshB: string;
  illustration: string;
}

const THEMES: Record<CategoryThemeGroup, CategoryTheme> = {
  breeds: {
    group: "breeds",
    label: "Breeds",
    accent: "#b45309",
    accentMuted: "#fef3c7",
    accentForeground: "#78350f",
    heroGradient:
      "linear-gradient(135deg, #fef3c7 0%, #fde68a 35%, #f5f0eb 70%, #faf9f7 100%)",
    meshA: "rgba(180, 83, 9, 0.12)",
    meshB: "rgba(217, 119, 6, 0.08)",
    illustration: "/images/illustrations/breeds.svg",
  },
  health: {
    group: "health",
    label: "Health",
    accent: "#2563eb",
    accentMuted: "#dbeafe",
    accentForeground: "#1e3a8a",
    heroGradient:
      "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 40%, #f0f9ff 75%, #faf9f7 100%)",
    meshA: "rgba(37, 99, 235, 0.1)",
    meshB: "rgba(59, 130, 246, 0.06)",
    illustration: "/images/illustrations/health.svg",
  },
  behavior: {
    group: "behavior",
    label: "Behavior",
    accent: "#ea580c",
    accentMuted: "#ffedd5",
    accentForeground: "#9a3412",
    heroGradient:
      "linear-gradient(135deg, #ffedd5 0%, #fed7aa 40%, #fff7ed 75%, #faf9f7 100%)",
    meshA: "rgba(234, 88, 12, 0.1)",
    meshB: "rgba(251, 146, 60, 0.08)",
    illustration: "/images/illustrations/behavior.svg",
  },
  nutrition: {
    group: "nutrition",
    label: "Nutrition",
    accent: "#16a34a",
    accentMuted: "#dcfce7",
    accentForeground: "#14532d",
    heroGradient:
      "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 40%, #f0fdf4 75%, #faf9f7 100%)",
    meshA: "rgba(22, 163, 74, 0.1)",
    meshB: "rgba(74, 222, 128, 0.08)",
    illustration: "/images/illustrations/nutrition.svg",
  },
  history: {
    group: "history",
    label: "History",
    accent: "#78716c",
    accentMuted: "#f5f5f4",
    accentForeground: "#44403c",
    heroGradient:
      "linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 40%, #fafaf9 75%, #faf9f7 100%)",
    meshA: "rgba(120, 113, 108, 0.1)",
    meshB: "rgba(168, 162, 158, 0.08)",
    illustration: "/images/illustrations/history.svg",
  },
  wild: {
    group: "wild",
    label: "Wild Cats",
    accent: "#15803d",
    accentMuted: "#d1fae5",
    accentForeground: "#14532d",
    heroGradient:
      "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 35%, #ecfdf5 70%, #faf9f7 100%)",
    meshA: "rgba(21, 128, 61, 0.12)",
    meshB: "rgba(52, 211, 153, 0.08)",
    illustration: "/images/illustrations/wild.svg",
  },
  default: {
    group: "default",
    label: "Encyclopedia",
    accent: "#c2410c",
    accentMuted: "#fff7ed",
    accentForeground: "#9a3412",
    heroGradient:
      "linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #faf9f7 100%)",
    meshA: "rgba(194, 65, 12, 0.08)",
    meshB: "rgba(251, 146, 60, 0.06)",
    illustration: "/images/illustrations/default.svg",
  },
};

const CATEGORY_TO_THEME: Partial<Record<CategorySlug, CategoryThemeGroup>> = {
  breeds: "breeds",
  health: "health",
  diseases: "health",
  symptoms: "health",
  behavior: "behavior",
  training: "behavior",
  nutrition: "nutrition",
  foods: "nutrition",
  plants: "nutrition",
  care: "default",
  anatomy: "health",
  history: "history",
  facts: "history",
  guides: "default",
  "wild-cats": "wild",
  compare: "default",
  calculators: "default",
  checklists: "default",
  resources: "default",
};

export function getCategoryTheme(category: CategorySlug): CategoryTheme {
  const group = CATEGORY_TO_THEME[category] ?? "default";
  return THEMES[group];
}

export function categoryThemeClass(category: CategorySlug): string {
  const group = CATEGORY_TO_THEME[category] ?? "default";
  return `theme-${group}`;
}
