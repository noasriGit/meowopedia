export const STATIC_PAGE_SLUGS = [
  "about",
  "accessibility",
  "editorial-standards",
  "medical-disclaimer",
  "privacy-policy",
  "terms-of-use",
] as const;

export type StaticPageSlug = (typeof STATIC_PAGE_SLUGS)[number];

export function isStaticPageSlug(slug: string): slug is StaticPageSlug {
  return (STATIC_PAGE_SLUGS as readonly string[]).includes(slug);
}

export function staticPagePath(slug: StaticPageSlug): string {
  return `/${slug}`;
}

export const STATIC_PAGE_NAV: { slug: StaticPageSlug; label: string }[] = [
  { slug: "about", label: "About" },
  { slug: "editorial-standards", label: "Editorial Standards" },
  { slug: "medical-disclaimer", label: "Medical Disclaimer" },
  { slug: "privacy-policy", label: "Privacy Policy" },
  { slug: "terms-of-use", label: "Terms of Use" },
  { slug: "accessibility", label: "Accessibility" },
];
