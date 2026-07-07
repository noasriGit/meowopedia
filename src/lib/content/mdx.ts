import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import { mdxComponents } from "@/components/mdx/mdx-components";

export async function renderMdxContent(
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

export async function renderMdxWithToc(source: string) {
  return renderMdxContent(source);
}
