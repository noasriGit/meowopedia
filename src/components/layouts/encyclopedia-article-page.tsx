import { notFound } from "next/navigation";
import { ArticlePageShell } from "@/components/layouts/article-page-shell";
import { BreedHeroSections, BreedSidebar } from "@/components/layouts/sidebars/breed-sidebar";
import { DiseaseSidebar } from "@/components/layouts/sidebars/disease-sidebar";
import { FoodSidebar } from "@/components/layouts/sidebars/food-sidebar";
import { PlantSidebar } from "@/components/layouts/sidebars/plant-sidebar";
import { BehaviorSidebar } from "@/components/layouts/sidebars/behavior-sidebar";
import { DefaultSidebar } from "@/components/layouts/sidebars/default-sidebar";
import { renderMdxContent } from "@/lib/content/mdx";
import {
  buildArticleJsonLd,
  breadcrumbSchema,
  JsonLdScript,
} from "@/lib/seo/json-ld";
import { buildArticleMetadata, articleBreadcrumbs } from "@/lib/seo/metadata";
import type { EntityLayoutKey, EntitySidebarKey } from "@/config/taxonomy";
import type { Article } from "@/types/content";

const SIDEBAR_MAP: Record<
  EntitySidebarKey,
  React.ComponentType<{ article: Article }>
> = {
  breed: BreedSidebar,
  disease: DiseaseSidebar,
  food: FoodSidebar,
  plant: PlantSidebar,
  behavior: BehaviorSidebar,
  default: DefaultSidebar,
};

interface EncyclopediaArticlePageProps {
  article: Article;
  layout: EntityLayoutKey;
  sidebar: EntitySidebarKey;
  schemaTypes?: string[];
}

export async function EncyclopediaArticlePage({
  article,
  layout,
  sidebar,
  schemaTypes = ["Article"],
}: EncyclopediaArticlePageProps) {
  if (!article) notFound();

  const Sidebar = SIDEBAR_MAP[sidebar];
  const content = await renderMdxContent(article.content);
  const breadcrumbs = articleBreadcrumbs(article);
  const jsonLd = [
    breadcrumbSchema(breadcrumbs),
    ...buildArticleJsonLd(article, schemaTypes),
  ];

  const breedSections =
    layout === "breed" ? <BreedHeroSections article={article} /> : undefined;

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <ArticlePageShell
        article={article}
        sidebar={<Sidebar article={article} />}
        sections={breedSections}
      >
        {content}
      </ArticlePageShell>
    </>
  );
}

export function createArticleMetadata(article: Article | undefined) {
  if (!article) return {};
  return buildArticleMetadata(article);
}
