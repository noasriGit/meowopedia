import type { CategorySlug } from "@/config/taxonomy";

export const DISCLAIMER_TIERS = ["medical", "safety", "general"] as const;
export type DisclaimerTier = (typeof DISCLAIMER_TIERS)[number];

export const POISON_HELPLINES = {
  aspca: { label: "ASPCA Animal Poison Control", phone: "(888) 426-4435" },
  petPoison: { label: "Pet Poison Helpline", phone: "(855) 764-7661" },
} as const;

export const CATEGORY_DISCLAIMER_TIER: Record<CategorySlug, DisclaimerTier> = {
  health: "medical",
  diseases: "medical",
  symptoms: "medical",
  care: "medical",
  foods: "safety",
  plants: "safety",
  nutrition: "general",
  guides: "general",
  breeds: "general",
  behavior: "general",
  facts: "general",
  anatomy: "general",
  compare: "general",
  history: "general",
  "wild-cats": "general",
  training: "general",
  calculators: "general",
  checklists: "general",
  resources: "general",
};

export interface DisclaimerCopy {
  ariaLabel: string;
  compact: string;
  full: {
    heading: string;
    paragraphs: string[];
  };
  link: { href: string; label: string };
}

export const DISCLAIMER_COPY: Record<DisclaimerTier, DisclaimerCopy> = {
  medical: {
    ariaLabel: "Medical disclaimer",
    compact:
      "Not veterinary advice — educational only. Always consult your veterinarian about your cat's health.",
    full: {
      heading: "Medical disclaimer",
      paragraphs: [
        "Meowopedia does not provide veterinary medical advice, diagnosis, or treatment. The information on this page is for general educational purposes only and is not a substitute for a physical examination, diagnostic testing, prescription medications, or emergency intervention by a licensed veterinarian.",
        "Never disregard professional veterinary advice or delay seeking it because of something you read here. Contact your veterinarian promptly if your cat shows signs of illness, injury, or distress — including difficulty breathing, collapse, repeated vomiting or diarrhea, inability to urinate, toxin ingestion, trauma, or significant behavior change.",
        "If you suspect your cat has ingested a toxic substance, contact a poison control center immediately. Have the product label or substance description ready. Do not induce vomiting unless specifically instructed by a veterinary professional.",
        "Use of Meowopedia does not create a veterinarian-client-patient relationship. You assume full responsibility for decisions made based on this content.",
      ],
    },
    link: { href: "/medical-disclaimer", label: "Read our full medical disclaimer" },
  },
  safety: {
    ariaLabel: "Food and plant safety disclaimer",
    compact:
      "Safety information is educational only. Contact your veterinarian or a poison control hotline if your cat ingests something harmful.",
    full: {
      heading: "Food & plant safety disclaimer",
      paragraphs: [
        "Meowopedia provides educational information about foods and plants that may affect cats. It is not veterinary advice, diagnosis, or treatment, and cannot account for your cat's age, health status, medications, or the amount ingested.",
        "Never feed your cat a new food or allow access to an unfamiliar plant based solely on this article. When in doubt, consult your veterinarian before offering anything outside your cat's regular diet.",
        "If your cat has ingested a food, plant, medication, or household substance — especially one flagged as toxic — contact your veterinarian or a poison control center immediately. Do not wait for symptoms. Do not induce vomiting unless specifically instructed by a veterinary professional.",
      ],
    },
    link: { href: "/medical-disclaimer", label: "Read our full medical disclaimer" },
  },
  general: {
    ariaLabel: "Educational disclaimer",
    compact:
      "Educational information only. Individual cats vary — consult your veterinarian for health concerns.",
    full: {
      heading: "Educational disclaimer",
      paragraphs: [
        "Meowopedia content is provided for general educational and informational purposes. It does not constitute veterinary, medical, legal, or other professional advice.",
        "Individual cats vary by breed, age, health status, and environment. Information on this page may not apply to your specific situation. For health concerns, always consult a licensed veterinarian.",
        "Content is provided as-is without warranties of completeness, accuracy, or fitness for a particular purpose. See our Terms of Use for limitation of liability.",
      ],
    },
    link: { href: "/terms-of-use", label: "Read our Terms of Use" },
  },
};
