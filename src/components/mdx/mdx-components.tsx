import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import {
  Callout,
  DefinitionBox,
  ExpertNote,
  HealthAlertBox,
  VetTip,
  WarningBox,
} from "@/components/encyclopedia/callouts";
import { DidYouKnow } from "@/components/editorial/cards/did-you-know";
import { MythVsFact } from "@/components/editorial/cards/myth-vs-fact";
import { PullQuote } from "@/components/editorial/cards/pull-quote";
import { StatCard } from "@/components/editorial/cards/stat-card";
import { cn, slugify } from "@/lib/utils";
import { resolveCitationUrl } from "@/lib/seo/citation-urls";

function createHeading(level: 2 | 3 | 4) {
  return function Heading({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    const text = String(children);
    const id = slugify(text);
    const Tag = `h${level}` as const;

    return (
      <Tag
        id={id}
        className={cn(
          "group scroll-mt-24 font-semibold tracking-tight",
          level === 2 &&
            "editorial-heading mt-14 mb-5 border-b border-border/60 pb-3 text-2xl lg:text-3xl",
          level === 3 && "mt-10 mb-3 text-xl lg:text-2xl",
          level === 4 && "mt-7 mb-2 text-lg"
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  };
}

export const mdxComponents: MDXComponents = {
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  p: ({ children, ...props }) => (
    <p className="leading-8 text-foreground/90 [&:first-of-type]:text-lg [&:first-of-type]:leading-relaxed" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-4 list-disc space-y-2 pl-6" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-4 list-decimal space-y-2 pl-6" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),
  a: ({ href, children, ...props }) => {
    const resolvedHref = href?.startsWith("http") ? resolveCitationUrl(href) : href;
    const isExternal = resolvedHref?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={resolvedHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-4 hover:underline"
        style={{ color: "var(--theme-accent, var(--primary))" }}
          {...props}
        >
          {children}
          <span className="sr-only"> (opens in new tab)</span>
        </a>
      );
    }
    return (
      <Link
        href={resolvedHref ?? "#"}
        className="font-medium underline-offset-4 hover:underline"
        style={{ color: "var(--theme-accent, var(--primary))" }}
        {...props}
      >
        {children}
      </Link>
    );
  },
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-6 border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted/50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  th: ({ children, ...props }) => (
    <th
      scope="col"
      className="border-b border-border px-4 py-3 text-left font-semibold"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-b border-border px-4 py-3" {...props}>
      {children}
    </td>
  ),
  Callout,
  VetTip,
  ExpertNote,
  HealthAlertBox,
  WarningBox,
  DefinitionBox,
  DidYouKnow,
  MythVsFact,
  PullQuote,
  StatCard,
};

export function extractHeadings(content: string) {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ id: slugify(text), text, level });
  }

  return headings;
}
