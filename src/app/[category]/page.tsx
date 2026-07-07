import { notFound } from "next/navigation";
import { CategoryPillarPage } from "@/components/layouts/category-pillar-page";
import { buildCategoryMetadata } from "@/lib/seo/metadata";
import {
  collectionPageSchema,
  JsonLdScript,
} from "@/lib/seo/json-ld";
import { getCategoryPageData } from "@/lib/content/categories";
import { isCategorySlug, type CategorySlug } from "@/config/taxonomy";
export const revalidate = 86400;

export async function generateStaticParams() {
  const { getAllCategorySlugs } = await import("@/lib/content/categories");
  return getAllCategorySlugs().map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategorySlug(category)) return {};
  return buildCategoryMetadata(category);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCategorySlug(category)) notFound();

  const data = getCategoryPageData(category as CategorySlug);

  return (
    <>
      <JsonLdScript
        data={collectionPageSchema(
          data.title,
          data.description,
          `/${category}`,
          data.articles
        )}
      />
      <CategoryPillarPage slug={category as CategorySlug} />
    </>
  );
}
