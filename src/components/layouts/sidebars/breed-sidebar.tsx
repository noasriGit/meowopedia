import { QuickFactsCard } from "@/components/encyclopedia/quick-facts";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/content";

interface BreedData {
  origin?: string;
  size?: string;
  weight?: string;
  lifespan?: string;
  temperament?: string[];
  hairLength?: string;
  energy?: string;
  kidFriendly?: string;
  apartmentFriendly?: string;
  shedding?: string;
}

export function BreedSidebar({ article }: { article: Article }) {
  const data = (article.data ?? {}) as BreedData;

  const facts: Record<string, React.ReactNode> = {};
  if (data.origin) facts["Origin"] = data.origin;
  if (data.size) facts["Size"] = data.size;
  if (data.weight) facts["Weight"] = data.weight;
  if (data.lifespan) facts["Life Expectancy"] = data.lifespan;
  if (data.hairLength) facts["Coat"] = data.hairLength;
  if (data.energy) facts["Energy"] = data.energy;
  if (data.shedding) facts["Shedding"] = data.shedding;
  if (data.kidFriendly) facts["Kid Friendly"] = data.kidFriendly;
  if (data.apartmentFriendly) facts["Apartment Friendly"] = data.apartmentFriendly;

  return (
    <>
      <QuickFactsCard title="Breed Facts" facts={facts} />
      {data.temperament?.length ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Temperament
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.temperament.map((trait) => (
              <Badge key={trait} variant="secondary">
                {trait}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function BreedHeroSections({ article }: { article: Article }) {
  const data = (article.data ?? {}) as BreedData;
  if (!data.temperament?.length) return null;

  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {data.temperament.map((trait) => (
        <Badge key={trait} variant="outline" className="text-sm">
          {trait}
        </Badge>
      ))}
    </div>
  );
}
