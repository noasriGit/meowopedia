/**
 * Canonical replacements for external citation URLs that moved or return 4xx to crawlers.
 * Applied at render time so MDX frontmatter stays stable.
 */
const CORNELL_FELINE_TOPICS =
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics";
const VCA_KNOW_YOUR_PET = "https://vcahospitals.com/know-your-pet";
const ASPCA_POISON_CONTROL = "https://www.aspca.org/pet-care/aspca-poison-control";

const CITATION_URL_REWRITES: Record<string, string> = {
  // Cornell Feline Health Center — path restructure
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feeding-your-cat":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/how-cats-communicate":
    "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information",
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-calicivirus":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-herpesvirus":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-panleukopenia":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/toxins":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-asthma":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/ticks":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/fleas-and-other-external-parasites":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/pain-management-cats":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/fluid-therapy-cats":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/vaccinations":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/play-and-exercise":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-skin-conditions":
    CORNELL_FELINE_TOPICS,
  "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-upper-respiratory-infection":
    CORNELL_FELINE_TOPICS,

  // VCA — topic pages consolidated under know-your-pet hub
  "https://vcahospitals.com/know-your-pet/excessive-vocalization-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/why-do-cats-eat-grass":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/catnip-and-your-cat":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/litter-box-problems-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/urine-marking-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/compulsive-grooming-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/drooling-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/essential-oils-and-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/lyme-disease-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/coughing-and-wheezing-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/how-to-tell-if-your-cat-is-in-pain":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/ibuprofen-toxicosis-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/allergies-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/ear-mites-in-cats-and-dogs":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/why-do-cats-knead-or-the-art-of-biscuit-making":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/purring-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/aggression-between-cats-in-your-household":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/dehydration-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/bathing-your-cat":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/cat-behavior-problems-sleeping-behavior-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/lice-in-cats":
    VCA_KNOW_YOUR_PET,
  "https://vcahospitals.com/know-your-pet/upper-respiratory-infection-in-cats":
    VCA_KNOW_YOUR_PET,

  // AVMA — retired pages replaced with stable veterinary sources
  "https://www.avma.org/resources-tools/pet-owners/petcare/air-quality-and-pets":
    CORNELL_FELINE_TOPICS,
  "https://www.avma.org/resources-tools/pet-owners/petcare/how-tell-if-your-cat-sick":
    CORNELL_FELINE_TOPICS,
  "https://www.avma.org/resources-tools/pet-owners/petcare/cat-behavior-problems":
    VCA_KNOW_YOUR_PET,
  "https://www.avma.org/resources/pet-owners/petcare/parasites-and-your-pet":
    "https://vcahospitals.com/know-your-pet/flea-control-in-cats",
  "https://www.avma.org/resources/pet-owners/petcare/lyme-disease":
    CORNELL_FELINE_TOPICS,
  "https://www.avma.org/resources-tools/pet-owners/petcare/rabies":
    "https://vcahospitals.com/know-your-pet/rabies-in-cats",
  "https://www.avma.org/resources-tools/pet-owners/petcare/flea-control-cats-and-dogs":
    "https://vcahospitals.com/know-your-pet/flea-control-in-cats",
  "https://www.avma.org/resources-tools/pet-owners/petcare/zoonotic-diseases":
    CORNELL_FELINE_TOPICS,

  // ASPCA — canonical poison control landing pages
  "https://www.aspca.org/pet-care/animal-poison-control":
    ASPCA_POISON_CONTROL,
  "https://www.aspca.org/pet-care/animal-poison-control/people-foods-avoid-feeding-your-pets":
    `${ASPCA_POISON_CONTROL}/people-foods-avoid-feeding-your-pets`,
  "https://www.aspca.org/pet-care/animal-poison-control/toxic-and-non-toxic-plants":
    `${ASPCA_POISON_CONTROL}/toxic-and-non-toxic-plants`,

  // IRIS CKD guidelines — guidelines path removed from site
  "https://iris-kidney.com/guidelines/":
    "https://www.iris-kidney.com/",
  "https://www.iris-kidney.com/guidelines/":
    "https://www.iris-kidney.com/",

  // CFA breed profiles
  "https://cfa.org/persian/":
    "https://cfa.org/breed/persian/",
  "https://cfa.org/breeds/persian/":
    "https://cfa.org/breed/persian/",

  // Journal articles — PubMed for crawler reliability
  "https://journals.sagepub.com/doi/10.1177/1098612X24493807":
    "https://pubmed.ncbi.nlm.nih.gov/33441426/",
  "https://journals.sagepub.com/doi/10.1177/1098612X19831253":
    "https://pubmed.ncbi.nlm.nih.gov/31845720/",
  "https://journals.sagepub.com/doi/10.1177/1098612X211020179":
    "https://pubmed.ncbi.nlm.nih.gov/31381357/",

  // DOI resolvers — direct publisher URLs
  "https://doi.org/10.1007/s11252-020-01010-5":
    "https://link.springer.com/article/10.1007/s11252-020-01010-5",
  "https://onlinelibrary.wiley.com/doi/10.1111/all.14013":
    "https://pubmed.ncbi.nlm.nih.gov/32342963/",

  // Retired popular press articles
  "https://www.scientificamerican.com/article/why-do-cats-get-the-zoomies/":
    "https://www.petmd.com/cat/behavior/why-do-cats-get-zoomies",

  // Other moved resources
  "https://www.w3.org/WAI/WCAG21/quickref/":
    "https://www.w3.org/WAI/WCAG22/quickref/",
  "https://animaldiversity.ummz.umich.edu/accounts/Vulpes_vulpes/":
    "https://animaldiversity.org/accounts/Vulpes_vulpes/",
};

export function resolveCitationUrl(url: string): string {
  return CITATION_URL_REWRITES[url] ?? url;
}
