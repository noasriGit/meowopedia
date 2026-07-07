import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: string | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meowopedia.com";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}

export function sortByDateDesc<T extends { updatedAt?: string; lastReviewed?: string }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.updatedAt ?? a.lastReviewed ?? 0).getTime();
    const dateB = new Date(b.updatedAt ?? b.lastReviewed ?? 0).getTime();
    return dateB - dateA;
  });
}

export function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function readingTimeLabel(minutes: number): string {
  if (minutes < 1) return "1 min read";
  return `${Math.ceil(minutes)} min read`;
}

export function difficultyLabel(
  difficulty: string | undefined
): string | undefined {
  if (!difficulty) return undefined;
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}
