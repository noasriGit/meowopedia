import { z } from "zod";
import { ENTITY_TYPES, CATEGORY_SLUGS } from "@/config/taxonomy";

const authorSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  credentials: z.string().optional(),
  avatar: z.string().optional(),
});

const relationshipSchema = z.object({
  type: z.enum([
    "parent",
    "child",
    "sibling",
    "related",
    "compared",
    "treats",
    "causes",
    "symptom-of",
    "breed-predisposition",
    "alternative",
    "see-also",
    "prerequisite",
    "next-reading",
  ]),
  target: z.string(),
  weight: z.number().min(0).max(1).optional(),
  label: z.string().optional(),
});

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const citationSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  publisher: z.string().optional(),
  accessedAt: z.string().optional(),
});

export const articleFrontmatterSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.enum(CATEGORY_SLUGS),
  entityType: z.enum(ENTITY_TYPES),
  aliases: z.array(z.string()).optional(),
  summary: z.string().min(20),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional(),
  lastReviewed: z.string().optional(),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  author: authorSchema.optional(),
  medicalReviewer: authorSchema.optional(),
  readingTime: z.number().optional(),
  faq: z.array(faqSchema).optional(),
  citations: z.array(citationSchema).optional(),
  relationships: z.array(relationshipSchema).optional(),
  relatedArticles: z.array(z.string()).optional(),
  relatedBreeds: z.array(z.string()).optional(),
  relatedDiseases: z.array(z.string()).optional(),
  relatedFoods: z.array(z.string()).optional(),
  relatedPlants: z.array(z.string()).optional(),
  relatedSymptoms: z.array(z.string()).optional(),
  relatedMedications: z.array(z.string()).optional(),
  relatedBehaviors: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  noindex: z.boolean().optional(),
  canonical: z.string().optional(),
  disclaimerTier: z
    .enum(["medical", "safety", "general", "none"])
    .optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export type ValidatedFrontmatter = z.infer<typeof articleFrontmatterSchema>;

export function validateFrontmatter(
  data: unknown,
  filePath: string
): ValidatedFrontmatter {
  const result = articleFrontmatterSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid frontmatter in ${filePath}: ${issues}`);
  }
  return result.data;
}
