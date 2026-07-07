import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getCategoryDisclaimerTier,
  getDisclaimerTier,
  shouldShowDisclaimer,
} from "./disclaimers";

function article(
  overrides: Partial<{
    category: Parameters<typeof getDisclaimerTier>[0]["category"];
    entityType: Parameters<typeof getDisclaimerTier>[0]["entityType"];
    disclaimerTier: Parameters<typeof getDisclaimerTier>[0]["disclaimerTier"];
  }>
) {
  return {
    category: "facts" as const,
    entityType: "fact" as const,
    ...overrides,
  };
}

describe("getDisclaimerTier", () => {
  it("returns safety for food articles like chocolate", () => {
    assert.equal(
      getDisclaimerTier(
        article({ category: "foods", entityType: "food" })
      ),
      "safety"
    );
  });

  it("returns medical for health category articles", () => {
    assert.equal(
      getDisclaimerTier(
        article({ category: "health", entityType: "parasite" })
      ),
      "medical"
    );
  });

  it("returns medical for disease entity types", () => {
    assert.equal(
      getDisclaimerTier(
        article({ category: "diseases", entityType: "disease" })
      ),
      "medical"
    );
  });

  it("returns general for breed articles", () => {
    assert.equal(
      getDisclaimerTier(
        article({ category: "breeds", entityType: "breed" })
      ),
      "general"
    );
  });

  it("returns medical for pregnancy guides", () => {
    assert.equal(
      getDisclaimerTier(
        article({ category: "guides", entityType: "pregnancy" })
      ),
      "medical"
    );
  });

  it("returns general for non-health guides", () => {
    assert.equal(
      getDisclaimerTier(
        article({ category: "guides", entityType: "guide" })
      ),
      "general"
    );
  });

  it("returns null when disclaimerTier is none", () => {
    assert.equal(
      getDisclaimerTier(
        article({
          category: "health",
          entityType: "medication",
          disclaimerTier: "none",
        })
      ),
      null
    );
  });

  it("respects explicit disclaimerTier overrides", () => {
    assert.equal(
      getDisclaimerTier(
        article({
          category: "breeds",
          entityType: "breed",
          disclaimerTier: "medical",
        })
      ),
      "medical"
    );
  });
});

describe("getCategoryDisclaimerTier", () => {
  it("maps symptoms to medical", () => {
    assert.equal(getCategoryDisclaimerTier("symptoms"), "medical");
  });

  it("maps behavior to general", () => {
    assert.equal(getCategoryDisclaimerTier("behavior"), "general");
  });

  it("maps foods to safety", () => {
    assert.equal(getCategoryDisclaimerTier("foods"), "safety");
  });
});

describe("shouldShowDisclaimer", () => {
  it("returns false when tier is none", () => {
    assert.equal(
      shouldShowDisclaimer(
        article({
          category: "health",
          entityType: "medication",
          disclaimerTier: "none",
        })
      ),
      false
    );
  });

  it("returns true for standard articles", () => {
    assert.equal(
      shouldShowDisclaimer(
        article({ category: "breeds", entityType: "breed" })
      ),
      true
    );
  });
});
