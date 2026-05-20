import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/13-investments.md
 * Status: planned
 */

test.describe("13: Investment Tracking", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/portfolio");
  });

  test("buy logged via chat", async ({ page }) => {
    test.todo();
  });

  test("portfolio page shows holdings", async ({ page }) => {
    test.todo();
  });

  test("sell reduces position", async ({ page }) => {
    test.todo();
  });

  test("empty state renders", async ({ page }) => {
    test.todo();
  });
});
