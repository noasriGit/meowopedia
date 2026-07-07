import fs from "node:fs";
import path from "node:path";
import type { CategorySlug } from "@/config/taxonomy";
import { getCategoryTheme } from "@/config/category-themes";

export type ImageLicense =
  | "original"
  | "cc0"
  | "cc-by"
  | "cc-by-sa"
  | "editorial"
  | "purchased"
  | "unsplash"
  | "pexels";

export interface ImageAsset {
  path?: string;
  url?: string;
  alt: string;
  license: ImageLicense;
  attribution?: string;
  source?: string;
  category?: CategorySlug;
  width?: number;
  height?: number;
}

export interface ResolvedArticleImage {
  src: string;
  alt: string;
  isIllustration: boolean;
  license?: ImageLicense;
  attribution?: string;
  source?: string;
}

const MANIFEST_PATH = path.join(process.cwd(), "content", "images", "manifest.json");
const ARTICLE_IMAGES_PATH = path.join(
  process.cwd(),
  "content",
  "images",
  "article-images.json"
);

let manifestCache: Record<string, ImageAsset> | null = null;
let articleImagesCache: Record<string, ImageAsset> | null = null;

function isRemoteUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}

export function isRemoteImageUrl(src: string): boolean {
  return isRemoteUrl(src);
}

function loadManifest(): Record<string, ImageAsset> {
  if (manifestCache) return manifestCache;
  if (!fs.existsSync(MANIFEST_PATH)) {
    manifestCache = {};
    return manifestCache;
  }
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  manifestCache = JSON.parse(raw) as Record<string, ImageAsset>;
  return manifestCache;
}

function loadArticleImages(): Record<string, ImageAsset> {
  if (articleImagesCache) return articleImagesCache;
  if (!fs.existsSync(ARTICLE_IMAGES_PATH)) {
    articleImagesCache = {};
    return articleImagesCache;
  }
  const raw = fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8");
  articleImagesCache = JSON.parse(raw) as Record<string, ImageAsset>;
  return articleImagesCache;
}

export function getImageAsset(imagePath: string): ImageAsset | undefined {
  const manifest = loadManifest();
  return manifest[imagePath];
}

export function getArticleImage(articleId: string): ImageAsset | undefined {
  const articleImages = loadArticleImages();
  return articleImages[articleId];
}

function findAssetByUrl(url: string): ImageAsset | undefined {
  const articleImages = loadArticleImages();
  for (const asset of Object.values(articleImages)) {
    if (asset.url === url) return asset;
  }
  const manifest = loadManifest();
  for (const asset of Object.values(manifest)) {
    if (asset.url === url || asset.path === url) return asset;
  }
  return undefined;
}

function toResolved(
  src: string,
  alt: string,
  asset?: ImageAsset
): ResolvedArticleImage {
  return {
    src,
    alt,
    isIllustration: false,
    license: asset?.license,
    attribution: asset?.attribution,
    source: asset?.source,
  };
}

export function resolveArticleImage(
  featuredImage: string | undefined,
  featuredImageAlt: string | undefined,
  category: CategorySlug,
  title: string,
  articleId?: string
): ResolvedArticleImage {
  const articleAsset = articleId ? getArticleImage(articleId) : undefined;

  if (featuredImage) {
    if (isRemoteUrl(featuredImage)) {
      const asset = findAssetByUrl(featuredImage) ?? articleAsset;
      return toResolved(
        featuredImage,
        featuredImageAlt ?? asset?.alt ?? title,
        asset
      );
    }

    const asset = getImageAsset(featuredImage) ?? articleAsset;
    const publicPath = path.join(
      process.cwd(),
      "public",
      featuredImage.replace(/^\//, "")
    );
    const exists = fs.existsSync(publicPath);

    if (exists) {
      return toResolved(
        featuredImage,
        featuredImageAlt ?? asset?.alt ?? title,
        asset
      );
    }
  }

  if (articleAsset?.url) {
    return toResolved(
      articleAsset.url,
      featuredImageAlt ?? articleAsset.alt ?? title,
      articleAsset
    );
  }

  const theme = getCategoryTheme(category);
  return {
    src: theme.illustration,
    alt: featuredImageAlt ?? `Illustration for ${title}`,
    isIllustration: true,
  };
}

export function requiresAttribution(license?: ImageLicense): boolean {
  return license === "cc-by" || license === "cc-by-sa";
}

export function invalidateImageManifestCache(): void {
  manifestCache = null;
  articleImagesCache = null;
}
