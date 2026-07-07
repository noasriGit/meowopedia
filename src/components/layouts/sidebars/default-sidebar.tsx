import { QuickFactsCard } from "@/components/encyclopedia/quick-facts";
import type { Article } from "@/types/content";
import { readingTimeLabel, difficultyLabel, formatDate } from "@/lib/utils";

export function DefaultSidebar({ article }: { article: Article }) {
  const facts: Record<string, React.ReactNode> = {
    Category: article.category.replace(/-/g, " "),
    Type: article.entityType.replace(/-/g, " "),
    "Reading Time": readingTimeLabel(article.readingTimeMinutes),
  };

  if (article.difficulty) {
    facts["Difficulty"] = difficultyLabel(article.difficulty);
  }
  if (article.lastReviewed) {
    facts["Last Reviewed"] = formatDate(article.lastReviewed);
  }

  return <QuickFactsCard facts={facts} />;
}
