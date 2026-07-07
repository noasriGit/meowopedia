import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaticPageLayout } from "@/components/layouts/static-page";
import { SITE } from "@/config/site";
import type { StaticPageSlug } from "@/config/static-pages";
import { loadStaticPage } from "@/lib/content/static-pages";
import {
  breadcrumbSchema,
  JsonLdScript,
  webPageSchema,
} from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const REVALIDATE_SECONDS = SITE.isr.revalidateSeconds;

export function createStaticPageHandlers(slug: StaticPageSlug) {
  return {
    generateMetadata: async (): Promise<Metadata> => {
      const page = loadStaticPage(slug);
      if (!page) return {};

      return buildMetadata({
        title: page.title,
        description: page.description,
        path: page.path,
        modifiedTime: page.lastUpdated,
      });
    },

    Page: async () => {
      const page = loadStaticPage(slug);
      if (!page) notFound();

      return (
        <>
          <JsonLdScript
            data={[
              webPageSchema(page),
              breadcrumbSchema([
                { name: "Home", path: "/" },
                { name: page.title, path: page.path },
              ]),
            ]}
          />
          <StaticPageLayout page={page} />
        </>
      );
    },
  };
}
