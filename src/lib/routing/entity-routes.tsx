import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  createArticleMetadata,
  EncyclopediaArticlePage,
} from "@/components/layouts/encyclopedia-article-page";
import { SITE } from "@/config/site";
import {
  ENTITY_ROUTES,
  getRouteForEntityType,
  type EntityRouteDefinition,
} from "@/config/taxonomy";
import {
  getArticleBySlug,
  getArticleByUrlPrefix,
  getStaticParamsForPrefix,
  getStaticParamsForRoute,
} from "@/lib/content/loader";

export function createEntityRouteHandlers(route: EntityRouteDefinition) {
  return {
    generateStaticParams: () => getStaticParamsForRoute(route),

    generateMetadata: async ({
      params,
    }: {
      params: Promise<{ slug: string }>;
    }): Promise<Metadata> => {
      const { slug } = await params;
      const article = getArticleBySlug(route, slug);
      return createArticleMetadata(article);
    },

    Page: async ({ params }: { params: Promise<{ slug: string }> }) => {
      const { slug } = await params;
      const article = getArticleBySlug(route, slug);
      if (!article) notFound();

      return (
        <EncyclopediaArticlePage
          article={article}
          layout={route.layout}
          sidebar={route.sidebar}
          schemaTypes={[...route.schemaTypes]}
        />
      );
    },
  };
}

export const REVALIDATE_SECONDS = SITE.isr.revalidateSeconds;

export function getAllEntityRoutes() {
  return ENTITY_ROUTES;
}

export function findRouteByUrlPrefix(prefix: string) {
  return ENTITY_ROUTES.find((r) => r.urlPrefix === prefix);
}

/** Route handler for a URL prefix — supports multiple entity types per directory */
export function createPrefixRouteHandlers(urlPrefix: string) {
  return {
    generateStaticParams: () => getStaticParamsForPrefix(urlPrefix),

    generateMetadata: async ({
      params,
    }: {
      params: Promise<{ slug: string }>;
    }): Promise<Metadata> => {
      const { slug } = await params;
      const article = getArticleByUrlPrefix(urlPrefix, slug);
      return createArticleMetadata(article);
    },

    Page: async ({ params }: { params: Promise<{ slug: string }> }) => {
      const { slug } = await params;
      const article = getArticleByUrlPrefix(urlPrefix, slug);
      if (!article) notFound();

      const route =
        getRouteForEntityType(article.entityType) ??
        findRouteByUrlPrefix(urlPrefix);
      if (!route) notFound();

      return (
        <EncyclopediaArticlePage
          article={article}
          layout={route.layout}
          sidebar={route.sidebar}
          schemaTypes={[...route.schemaTypes]}
        />
      );
    },
  };
}

export { getRouteForEntityType };
