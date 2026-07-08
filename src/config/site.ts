import type { Metadata } from "next";

export const SITE = {
  name: "Meowopedia",
  tagline: "The Definitive Encyclopedia of Cats",
  description:
    "The largest encyclopedia about cats on the internet. Breeds, health, behavior, nutrition, and the complete feline knowledge graph.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://meowopedia.com",
  locale: "en_US",
  twitter: "@meowopedia",
  defaultOgImage: "/og/default.jpg",
  organization: {
    name: "Meowopedia",
    logo: "/favicon.svg",
    sameAs: [
      "https://twitter.com/meowopedia",
      "https://www.facebook.com/meowopedia",
      "https://www.instagram.com/meowopedia",
    ],
  },
  editorial: {
    defaultAuthor: {
      name: "Meowopedia Editorial Team",
      credentials: "Feline encyclopedia editors",
    },
  },
  contactEmail: "hello@meowopedia.com",
  search: {
    minQueryLength: 2,
    maxResults: 12,
    debounceMs: 200,
  },
  isr: {
    revalidateSeconds: 86400, // 24 hours
    onDemandPaths: true,
  },
  homeHero: {
    src: "/images/hero/home-hero.jpg",
    alt: "A grey kitten peering from a garden bush near flowers",
    attribution: "via Wikimedia Commons",
    license: "cc-by-sa" as const,
    source: "wikimedia",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kitten_in_a_bush_near_flowers.jpg",
  },
} as const;

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    images: [{ url: SITE.defaultOgImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "geyhbUQqwAZ8-GuvFaylJB0kmKSYb-nytu5Z576y4bk",
  },
};
