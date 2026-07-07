import { SITE } from "@/config/site";
import { absoluteUrl } from "@/lib/utils";
import type { Article, ArticleSummary } from "@/types/content";

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.organization.name,
    url: SITE.url,
    logo: absoluteUrl(SITE.organization.logo),
    sameAs: SITE.organization.sameAs,
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    publisher: organizationSchema(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleSchema(article: Article): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    url: absoluteUrl(article.url),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.lastReviewed,
    author: article.author
      ? {
          "@type": "Person",
          name: article.author.name,
          ...(article.author.credentials && {
            jobTitle: article.author.credentials,
          }),
        }
      : {
          "@type": "Organization",
          name: SITE.editorial.defaultAuthor.name,
        },
    publisher: organizationSchema(),
    image: article.featuredImage
      ? absoluteUrl(article.featuredImage)
      : absoluteUrl(SITE.defaultOgImage),
    mainEntityOfPage: absoluteUrl(article.url),
    keywords: article.tags?.join(", "),
  };
}

export function medicalWebPageSchema(article: Article): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: article.title,
    description: article.summary,
    url: absoluteUrl(article.url),
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.lastReviewed,
    lastReviewed: article.lastReviewed,
    ...(article.medicalReviewer && {
      reviewedBy: {
        "@type": "Person",
        name: article.medicalReviewer.name,
        jobTitle: article.medicalReviewer.credentials,
      },
    }),
    publisher: organizationSchema(),
  };
}

export function definedTermSchema(article: Article): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: article.title,
    description: article.summary,
    url: absoluteUrl(article.url),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: SITE.name,
      url: SITE.url,
    },
  };
}

export function faqSchema(
  faq: { question: string; answer: string }[]
): JsonLd | null {
  if (!faq.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function howToSchema(
  name: string,
  description: string,
  steps: { name: string; text: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function collectionPageSchema(
  name: string,
  description: string,
  path: string,
  items: ArticleSummary[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.slice(0, 20).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(item.url),
        name: item.title,
      })),
    },
  };
}

export function webPageSchema(page: {
  title: string;
  description: string;
  path: string;
  lastUpdated: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: absoluteUrl(page.path),
    dateModified: page.lastUpdated,
    publisher: organizationSchema(),
  };
}

export function imageObjectSchema(
  url: string,
  caption: string,
  width = 1200,
  height = 630
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    url: absoluteUrl(url),
    caption,
    width,
    height,
  };
}

export function buildArticleJsonLd(
  article: Article,
  schemaTypes: string[] = ["Article"]
): JsonLd[] {
  const schemas: JsonLd[] = [websiteSchema()];

  if (schemaTypes.includes("MedicalWebPage")) {
    schemas.push(medicalWebPageSchema(article));
  } else if (schemaTypes.includes("DefinedTerm")) {
    schemas.push(definedTermSchema(article));
  } else {
    schemas.push(articleSchema(article));
  }

  if (article.faq?.length && schemaTypes.includes("FAQPage")) {
    const faq = faqSchema(article.faq);
    if (faq) schemas.push(faq);
  }

  return schemas;
}

export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  const json = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
