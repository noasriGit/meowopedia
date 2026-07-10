const WIKIMEDIA_COMMONS =
  /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(?!thumb\/)([0-9a-f]\/[0-9a-f]{2}\/)(.+)$/i;

const WIKIMEDIA_THUMB =
  /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/([0-9a-f]\/[0-9a-f]{2}\/)(.+)\/\d+px-.+$/i;

const FLICKR_HOST = /^https:\/\/live\.staticflickr\.com\//i;

/** Stable Wikimedia fallbacks when remote hosts fail or rate-limit crawlers. */
const FALLBACK_CAT_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/a/af/2_Sphynx_cats_sleeping_together.jpg";

/** Wikimedia serves thumbs at 1280px; 1200px requests return 400. */
const WIKIMEDIA_DISPLAY_WIDTH = 1280;

/**
 * Convert a full-size Wikimedia Commons URL to a sized thumbnail on the same CDN.
 * Keeps stored MDX URLs canonical while delivering smaller files to browsers and crawlers.
 */
export function wikimediaThumbUrl(
  url: string,
  maxWidth = WIKIMEDIA_DISPLAY_WIDTH
): string {
  if (url.includes("/thumb/")) return url;

  const match = url.match(WIKIMEDIA_COMMONS);
  if (!match) return url;

  const [, hashPath, filename] = match;
  const baseName = filename.split("/").pop() ?? filename;
  const thumbName = `${maxWidth}px-${baseName}`;

  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${hashPath}${filename}/${thumbName}`;
}

/** Recover the canonical full-size URL from a Wikimedia thumb URL. */
export function wikimediaCanonicalUrl(url: string): string | undefined {
  const match = url.match(WIKIMEDIA_THUMB);
  if (!match) return undefined;
  const [, hashPath, filename] = match;
  return `https://upload.wikimedia.org/wikipedia/commons/${hashPath}${filename}`;
}

export function isFlickrImageUrl(url: string): boolean {
  return FLICKR_HOST.test(url);
}

export function isWikimediaImageUrl(url: string): boolean {
  return url.includes("upload.wikimedia.org");
}

/**
 * Normalize remote image URLs for display.
 * Content keeps full canonical URLs; runtime uses Wikimedia thumbs when available.
 */
export function optimizeRemoteImageUrl(
  url: string,
  options?: { maxWidth?: number; fallback?: string }
): string {
  if (isFlickrImageUrl(url)) {
    return options?.fallback ?? FALLBACK_CAT_IMAGE;
  }

  if (isWikimediaImageUrl(url)) {
    return wikimediaThumbUrl(url, options?.maxWidth ?? WIKIMEDIA_DISPLAY_WIDTH);
  }

  return url;
}

/**
 * Remote Wikimedia/Unsplash URLs must bypass the Next.js image optimizer.
 * The optimizer proxies every request through our server IP, which Wikimedia rate-limits (429).
 */
export function shouldBypassImageOptimizer(url: string): boolean {
  return /^https?:\/\//.test(url);
}
