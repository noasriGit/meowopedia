import { cache } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import { mdxComponents } from "@/components/mdx/mdx-components";

async function compileMdx(
  source: string,
  extraComponents?: MDXComponents
) {
  const { content } = await compileMDX({
    source,
    components: { ...mdxComponents, ...extraComponents },
    options: {
      parseFrontmatter: false,
    },
  });

  return content;
}

export const renderMdxContent = cache(compileMdx);

export async function renderMdxWithToc(source: string) {
  return renderMdxContent(source);
}
