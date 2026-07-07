import type { HeroVariant } from "@/lib/editorial/presentation";
import type { HeroSharedProps } from "./hero-shared";
import { EditorialHero } from "./editorial-hero";
import { ImmersiveHero } from "./immersive-hero";
import { MagazineHero } from "./magazine-hero";
import { MinimalHero } from "./minimal-hero";
import { SplitHero } from "./split-hero";

interface ArticleHeroProps extends HeroSharedProps {
  variant: HeroVariant;
}

export function ArticleHero({ variant, ...props }: ArticleHeroProps) {
  switch (variant) {
    case "immersive":
      return <ImmersiveHero {...props} />;
    case "split":
      return <SplitHero {...props} />;
    case "editorial":
      return <EditorialHero {...props} />;
    case "magazine":
      return <MagazineHero {...props} />;
    case "minimal":
      return <MinimalHero {...props} />;
    default:
      return <EditorialHero {...props} />;
  }
}
