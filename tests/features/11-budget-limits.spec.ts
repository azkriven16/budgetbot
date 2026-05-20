import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/11-budget-limits.md
 * Status: planned
 */

test.describe("11: Budget Limits", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("budget progress bar renders", async ({ page }) => {
    test.todo();
  });

  test("over-budget bar turns red", async ({ page }) => {
    test.todo();
  });

  test("chat warning on overspend", async ({ page }) => {
    test.todo();
  });
});
