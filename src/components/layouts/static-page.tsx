import { Breadcrumbs } from "@/components/encyclopedia/breadcrumbs";
import { renderMdxContent } from "@/lib/content/mdx";
import { formatDate } from "@/lib/utils";
import type { StaticPage } from "@/types/static-page";

interface StaticPageLayoutProps {
  page: StaticPage;
}

export async function StaticPageLayout({ page }: StaticPageLayoutProps) {
  const content = await renderMdxContent(page.content);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: page.title, path: page.path },
        ]}
        className="mb-6"
      />

      <header>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          {page.title}
        </h1>
        {page.lastUpdated ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated {formatDate(page.lastUpdated)}
          </p>
        ) : null}
      </header>

      <div className="prose-encyclopedia mt-10">{content}</div>
    </article>
  );
}
