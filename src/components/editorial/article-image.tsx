import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  isRemoteImageUrl,
  requiresAttribution,
  resolveArticleImage,
} from "@/lib/images/registry";
import type { CategorySlug } from "@/config/taxonomy";

interface ArticleImageProps {
  articleId?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  category: CategorySlug;
  title: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  fill?: boolean;
  aspectClassName?: string;
  showAttribution?: boolean;
}

function ImageAttribution({
  attribution,
  source,
  className,
}: {
  attribution?: string;
  source?: string;
  className?: string;
}) {
  if (!attribution) return null;

  return (
    <p
      className={cn(
        "text-xs text-muted-foreground",
        className
      )}
    >
      Photo: {attribution}
      {source ? ` / ${source}` : ""}
    </p>
  );
}

export function ArticleImage({
  articleId,
  featuredImage,
  featuredImageAlt,
  category,
  title,
  priority = false,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px",
  fill = false,
  aspectClassName = "aspect-[16/10]",
  showAttribution = true,
}: ArticleImageProps) {
  const resolved = resolveArticleImage(
    featuredImage,
    featuredImageAlt,
    category,
    title,
    articleId
  );
  const { src, alt, isIllustration, license, attribution, source } = resolved;
  const showCredit =
    showAttribution && !isIllustration && requiresAttribution(license);
  const remoteImage = isRemoteImageUrl(src);

  if (fill) {
    return (
      <>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          unoptimized={remoteImage}
          sizes={sizes}
          className={cn(
            "object-cover",
            isIllustration && "object-contain p-8 opacity-90",
            className
          )}
        />
        {showCredit && (
          <ImageAttribution
            attribution={attribution}
            source={source}
            className="absolute bottom-2 right-2 rounded bg-background/80 px-2 py-1"
          />
        )}
      </>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-muted/30",
          aspectClassName
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          unoptimized={remoteImage}
          sizes={sizes}
          className={cn(
            "object-cover transition-transform duration-500 ease-out motion-safe:hover:scale-[1.02]",
            isIllustration && "object-contain p-6 sm:p-10"
          )}
        />
      </div>
      {showCredit && (
        <ImageAttribution attribution={attribution} source={source} />
      )}
    </div>
  );
}
