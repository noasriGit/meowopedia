import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { CATEGORIES, getCategoryDefinition } from "@/config/taxonomy";
import { getCategoryBanner } from "@/lib/images/category-banners";
import { absoluteUrl } from "@/lib/utils";
import type { Article, ArticleSummary } from "@/types/content";

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  canonical?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
}

export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const url = absoluteUrl(options.path);
  const canonicalUrl = options.canonical
    ? absoluteUrl(options.canonical)
    : url;
  const image = options.image ?? SITE.defaultOgImage;

  return {
    title: options.title,
    description: options.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url,
      type: options.type ?? "website",
      siteName: SITE.name,
      locale: SITE.locale,
      images: [
        {
          url: absoluteUrl(image),
          alt: options.imageAlt ?? options.title,
          width: 1200,
          height: 630,
        },
      ],
      ...(options.publishedTime && { publishedTime: options.publishedTime }),
      ...(options.modifiedTime && { modifiedTime: options.modifiedTime }),
      ...(options.authors && { authors: options.authors }),
      ...(options.tags && { tags: options.tags }),
    },
    twitter: {
      card: "summary_large_image",
      site: SITE.twitter,
      title: options.title,
      description: options.description,
      images: [absoluteUrl(image)],
    },
    robots: options.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function buildArticleMetadata(article: Article): Metadata {
  return buildMetadata({
    title: article.title,
    description: article.summary,
    path: article.url,
    image: article.featuredImage,
    imageAlt: article.featuredImageAlt ?? article.title,
    noindex: article.noindex,
    canonical: article.canonical,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt ?? article.lastReviewed,
    authors: article.author ? [article.author.name] : undefined,
    tags: article.tags,
  });
}

export function buildCategoryMetadata(
  categorySlug: keyof typeof CATEGORIES
): Metadata {
  const category = getCategoryDefinition(categorySlug);
  const banner = getCategoryBanner(categorySlug);
  return buildMetadata({
    title: category.title,
    description: category.description,
    path: `/${category.slug}`,
    image: banner?.url,
    imageAlt: banner?.alt ?? category.title,
  });
}

export function buildBreadcrumbs(
  items: { name: string; path: string }[]
): { name: string; path: string }[] {
  return [{ name: "Home", path: "/" }, ...items];
}

export function articleBreadcrumbs(article: ArticleSummary) {
  const category = getCategoryDefinition(article.category);
  return buildBreadcrumbs([
    { name: category.title, path: `/${article.category}` },
    { name: article.title, path: article.url },
  ]);
}
