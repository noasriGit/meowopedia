import type { Metadata } from "next";

export const SITE = {
  name: "Meowopedia",
  tagline: "The Definitive Encyclopedia of Cats",
  description:
    "The largest encyclopedia about cats on the internet. Breeds, health, behavior, nutrition, and the complete feline knowledge graph.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.meowopedia.com",
  locale: "en_US",
  twitter: "@meowopedia",
  defaultOgImage:
    "https://upload.wikimedia.org/wikipedia/commons/a/af/2_Sphynx_cats_sleeping_together.jpg",
  organization: {
    name: "Meowopedia",
    logo: "/web-app-manifest-192x192.png",
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
    src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Cat_November_2010-1a.jpg",
    alt: "A cat yawning in warm sunlight",
    attribution: "via Wikimedia Commons",
    license: "cc-by-sa" as const,
    source: "wikimedia",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kitten_in_a_bush_near_flowers.jpg",
  },
} as const;

export const DEFAULT_METADATA: Metadata = {
  metadataBase: new URL(SITE.url),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
  manifest: "/site.webmanifest",
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
