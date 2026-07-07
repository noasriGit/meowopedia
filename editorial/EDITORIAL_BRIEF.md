# Meowopedia Editorial Brief

## Quality Standard (Article #1 reference)
See `content/behavior/making-biscuits.mdx` for the gold standard.

## MDX Frontmatter Template

```yaml
---
id: unique-kebab-id
title: Primary Search Title (question form when applicable)
slug: url-slug
category: foods|plants|behavior|guides|symptoms|health|facts|anatomy|care|nutrition|diseases|breeds|compare
entityType: food|plant|behavior|guide|symptom|parasite|vaccination|medication|fact|anatomy|care-guide|nutrition|disease|pregnancy|kitten|life-stage|cat-sound|body-language|comparison|health-symptom|poisonous-food
aliases:
  - variant keyword 1
  - variant keyword 2
summary: 20+ char SEO description answering core intent
difficulty: beginner|intermediate|advanced
lastReviewed: "2026-07-06"
updatedAt: "2026-07-06"
publishedAt: "2026-07-06"
featuredImage: https://upload.wikimedia.org/wikipedia/commons/example.jpg
featuredImageAlt: Descriptive alt text for the featured image
medicalReviewer:  # REQUIRED for health/medical content
  name: Dr. Sarah Chen, DVM
  credentials: Board-certified in small animal internal medicine
data:  # entity-specific sidebar fields
faq:
  - question: ...
    answer: ...
citations:
  - title: ...
    url: https://...
    publisher: VCA|Cornell|ASPCA|AVMA|etc
relationships:
  - type: related|see-also|causes|alternative
    target: other-article-id
disclaimerTier: medical|safety|general|none  # optional override; omit for automatic tier
---
```

## Featured Images

Every encyclopedia article should have a unique copyright-free featured image:

- Set `featuredImage` to a remote HTTPS URL (Wikimedia Commons, Unsplash, Pexels, or Openverse)
- Set `featuredImageAlt` to descriptive alt text for accessibility and SEO
- Canonical metadata (license, attribution, source) lives in `content/images/article-images.json` keyed by article `id`
- **Daily draft pipeline:** `npm run prepare-article-image -- --id <articleId>` sources the hero image and runs the audit heuristics in `scripts/editorial/image-relevance.mjs`. Do not publish until `npm run check-article-image -- --id <articleId>` exits 0.
- **Bulk assign:** `npm run source-images` auto-assigns all articles; `npm run rescore-images` re-evaluates bad picks
- **Review gallery:** `npm run audit-images` → open `http://localhost:3000/image-audit.html` to visually inspect every hero
- **Validation:** `npm run validate-images` checks uniqueness and URL health (runs on prebuild)

Image quality rules (enforced by audit):

- Foods and behavior articles: image must show a **cat**; alt text must mention the topic (e.g. "Cat eating fish — tuna and cats")
- Plants: botanical photo is fine; alt must name the plant
- Blocked alt terms: people, portraits, mites, unrelated stock phrases
- Never trust alt text alone — pick images where the subject visually matches the article
- CC-BY and CC-BY-SA images display attribution automatically; CC0/Unsplash/Pexels do not require visible credit

## MDX Components Available
- `<VetTip title="...">...</VetTip>`
- `<HealthAlertBox title="...">...</HealthAlertBox>`
- `<WarningBox title="...">...</WarningBox>`
- `<ExpertNote title="...">...</ExpertNote>`
- `<Callout variant="info|warning|danger|vet|expert">...</Callout>`
- `<DefinitionBox term="...">...</DefinitionBox>`

## Automatic Disclaimers

Every encyclopedia article and category page displays **tiered legal disclaimers** automatically — no MDX markup required:

| Tier | Applies to |
|------|------------|
| **medical** | Health, diseases, symptoms, care, and health-related guides (pregnancy, kitten, life-stage) |
| **safety** | Foods and plants |
| **general** | Breeds, behavior, facts, anatomy, compare, and other non-medical content |

Each article shows a **compact notice** at the top of the body and a **full disclaimer block** after the FAQ (before related articles). Category pillar pages show the same pattern.

- Continue using `<HealthAlertBox>`, `<VetTip>`, and `<WarningBox>` for topic-specific emergencies — these complement the automatic legal disclaimers.
- Set `medicalReviewer` on health content; the reviewer's name and credentials appear in the full medical disclaimer block.
- Override with `disclaimerTier: medical|safety|general|none` in frontmatter only when needed (e.g. `none` to suppress on a special page).

## Writing Rules
- NO AI filler: "In today's world", "When it comes to", "In conclusion"
- Cite real sources only (VCA, Cornell Feline Health, ASPCA Poison Control, AVMA, peer-reviewed)
- Never invent citations
- Answer ALL merged keyword variants in dedicated sections
- 800-2500 words based on topic complexity
- Unique structure per article type — food pages differ from behavior pages
- Use tables where useful
- 4-6 FAQ items minimum

## Content Directories
| Directory | URL Prefix |
|-----------|------------|
| content/foods | /foods |
| content/plants | /plants |
| content/behavior | /behavior |
| content/guides | /guides |
| content/symptoms | /symptoms |
| content/health | /health |
| content/facts | /facts |
| content/anatomy | /anatomy |
| content/care | /care |
| content/nutrition | /nutrition |
| content/diseases | /diseases |
| content/compare | /compare |
| content/breeds | /breeds |

## Existing Article IDs for cross-linking
- breed-persian, disease-ckd, food-chocolate, plant-lily, behavior-making-biscuits
