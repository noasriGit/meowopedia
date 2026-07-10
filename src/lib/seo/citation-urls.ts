/**
 * Canonical replacements for external citation URLs that moved or return 4xx to crawlers.
 * Applied at render time so MDX frontmatter stays stable.
 */
const CITATION_URL_REWRITES: Record<string, string> = {
  // Cornell Feline Health Center — path restructure
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feeding-your-cat":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/how-cats-communicate":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-calicivirus":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-herpesvirus":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-panleukopenia":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/toxins":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-asthma":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/ticks":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/fleas-and-other-external-parasites":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/pain-management-cats":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/fluid-therapy-cats":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/vaccinations":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/play-and-exercise":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-skin-conditions":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics",

  // VCA — topic pages consolidated under know-your-pet hub
  "https://vcahospitals.com/know-your-pet/excessive-vocalization-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/why-do-cats-eat-grass":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/catnip-and-your-cat":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/litter-box-problems-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/urine-marking-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/compulsive-grooming-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/drooling-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/essential-oils-and-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/lyme-disease-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/coughing-and-wheezing-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/how-to-tell-if-your-cat-is-in-pain":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/ibuprofen-toxicosis-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/allergies-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/ear-mites-in-cats-and-dogs":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/why-do-cats-knead-or-the-art-of-biscuit-making":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/purring-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/aggression-between-cats-in-your-household":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/dehydration-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/bathing-your-cat":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/cat-behavior-problems-sleeping-behavior-in-cats":
    "https://vcahospitals.com/know-your-pet",
  "https://vcahospitals.com/know-your-pet/lice-in-cats":
    "https://vcahospitals.com/know-your-pet",

  // AVMA — pet owner resource hubs
  "https://www.avma.org/resources-tools/pet-owners/petcare/vaccinations":
    "https://www.avma.org/resources-tools/pet-owners/petcare",
  "https://www.avma.org/resources-tools/pet-owners/petcare/household-hazards":
    "https://www.avma.org/resources-tools/pet-owners/petcare",
  "https://www.avma.org/resources-tools/pet-owners/petcare/air-quality-and-pets":
    "https://www.avma.org/resources-tools/pet-owners/petcare",
  "https://www.avma.org/resources-tools/pet-owners/petcare/how-tell-if-your-cat-sick":
    "https://www.avma.org/resources-tools/pet-owners/petcare",
  "https://www.avma.org/resources-tools/pet-owners/petcare/cat-behavior-problems":
    "https://www.avma.org/resources-tools/pet-owners/petcare",
  "https://www.avma.org/resources/pet-owners/petcare/parasites-and-your-pet":
    "https://www.avma.org/resources-tools/pet-owners/petcare",
  "https://www.avma.org/resources/pet-owners/petcare/lyme-disease":
    "https://www.avma.org/resources-tools/pet-owners/petcare",
  "https://www.avma.org/resources-tools/pet-owners/petcare/rabies":
    "https://www.avma.org/resources-tools/pet-owners/petcare",
  "https://www.avma.org/resources-tools/pet-owners/emergencycare/first-aid-tips-pet-owners":
    "https://www.avma.org/resources-tools/pet-owners/emergencycare",

  // ASPCA — canonical poison control landing pages
  "https://www.aspca.org/pet-care/animal-poison-control/people-foods-avoid-feeding-your-pets":
    "https://www.aspca.org/pet-care/animal-poison-control",
  "https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants":
    "https://www.aspca.org/pet-care/animal-poison-control",

  // Other moved resources
  "https://iris-kidney.com/guidelines/":
    "https://www.iris-kidney.com/guidelines/",
  "https://cfa.org/persian/":
    "https://cfa.org/breeds/persian/",
  "https://www.w3.org/WAI/WCAG21/quickref/":
    "https://www.w3.org/WAI/WCAG22/quickref/",
  "https://animaldiversity.ummz.umich.edu/accounts/Vulpes_vulpes/":
    "https://animaldiversity.org/accounts/Vulpes_vulpes/",
};

export function resolveCitationUrl(url: string): string {
  return CITATION_URL_REWRITES[url] ?? url;
}
