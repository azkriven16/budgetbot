import { test } from "@playwright/test";

/**
 * Spec: context/feature-specs/16-parse-correction.md
 * Status: planned
 *
 * Each test below maps to an acceptance criterion in the spec.
 * Replace test.todo() with real assertions when the feature is implemented.
 */

test.describe("16: Parse Correction (HITL)", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: sign in and navigate to /chat
    await page.goto("/chat");
  });

  test("amount correction patches transaction and adjusts balance", async ({ page }) => {
    test.todo();
  });

  test("undo deletes the most recent transaction and reverses balance", async ({ page }) => {
    test.todo();
  });

  test("correction reply shows old and new values", async ({ page }) => {
    test.todo();
  });

  test("correction with no prior transaction returns helpful reply", async ({ page }) => {
    test.todo();
  });
});
