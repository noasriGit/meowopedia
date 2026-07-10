import { getCategoryTheme, type CategoryThemeGroup } from "@/config/category-themes";
import type { CategorySlug } from "@/config/taxonomy";
import { hashString } from "@/lib/editorial/presentation";

export interface ArticleHeroGradientStyles {
  light: string;
  dark: string;
  meshA: string;
  meshB: string;
  meshC: string;
}

const PALETTES: Record<
  CategoryThemeGroup,
  { light: readonly string[]; dark: readonly string[] }
> = {
  breeds: {
    light: ["#fef3c7", "#fde68a", "#fff7ed", "#ffedd5", "#faf9f7", "#fcd34d"],
    dark: ["#1a1410", "#211810", "#1c1512", "#15100c", "#0c0a09", "#241a14"],
  },
  health: {
    light: ["#dbeafe", "#bfdbfe", "#eff6ff", "#e0f2fe", "#faf9f7", "#93c5fd"],
    dark: ["#0c1218", "#101820", "#0e161c", "#0a1014", "#0c0a09", "#121c28"],
  },
  behavior: {
    light: ["#ffedd5", "#fed7aa", "#fff7ed", "#ffedd5", "#faf9f7", "#fdba74"],
    dark: ["#1a120c", "#20160e", "#181008", "#140c08", "#0c0a09", "#24180c"],
  },
  nutrition: {
    light: ["#dcfce7", "#bbf7d0", "#f0fdf4", "#ecfdf5", "#faf9f7", "#86efac"],
    dark: ["#0c1410", "#101a14", "#0e1812", "#0a120c", "#0c0a09", "#122018"],
  },
  history: {
    light: ["#f5f5f4", "#e7e5e4", "#fafaf9", "#f5f0eb", "#faf9f7", "#d6d3d1"],
    dark: ["#141312", "#1a1816", "#121110", "#0e0d0c", "#0c0a09", "#1c1a18"],
  },
  wild: {
    light: ["#d1fae5", "#a7f3d0", "#ecfdf5", "#dcfce7", "#faf9f7", "#6ee7b7"],
    dark: ["#0c1410", "#101a14", "#0e1812", "#0a120e", "#0c0a09", "#12241a"],
  },
  default: {
    light: ["#fff7ed", "#ffedd5", "#fef3c7", "#faf9f7", "#fde68a", "#fed7aa"],
    dark: ["#161210", "#1c1610", "#14100c", "#100c08", "#0c0a09", "#201810"],
  },
};

function pickColor(
  colors: readonly string[],
  seed: number,
  shift: number
): string {
  return colors[(seed >> shift) % colors.length];
}

function adjustAlpha(rgba: string, alpha: number): string {
  return rgba.replace(/,\s*[\d.]+\)$/, `, ${alpha})`);
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const value = Number.parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getArticleHeroGradientStyles(
  articleId: string,
  category: CategorySlug
): ArticleHeroGradientStyles {
  const theme = getCategoryTheme(category);
  const palette = PALETTES[theme.group];
  const seed = hashString(articleId);
  const angle = 125 + (seed % 48);
  const midA = 18 + (seed % 14);
  const midB = 44 + ((seed >> 4) % 18);

  const light = `linear-gradient(${angle}deg, ${pickColor(palette.light, seed, 0)} 0%, ${pickColor(palette.light, seed, 2)} ${midA}%, ${pickColor(palette.light, seed, 4)} ${midB}%, ${pickColor(palette.light, seed, 1)} 100%)`;
  const dark = `linear-gradient(${angle}deg, ${pickColor(palette.dark, seed, 0)} 0%, ${pickColor(palette.dark, seed, 2)} ${midA}%, ${pickColor(palette.dark, seed, 4)} ${midB}%, ${pickColor(palette.dark, seed, 1)} 100%)`;

  const meshSeed = seed >> 8;
  const meshAlpha = 0.08 + (meshSeed % 6) * 0.02;

  return {
    light,
    dark,
    meshA: adjustAlpha(theme.meshA, meshAlpha + 0.06),
    meshB: adjustAlpha(theme.meshB, meshAlpha),
    meshC: hexToRgba(theme.accent, 0.06 + (meshSeed % 5) * 0.02),
  };
}
