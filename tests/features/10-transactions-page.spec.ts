import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/10-transactions-page.md
 * Status: planned
 */

test.describe("10: Transactions Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/transactions");
  });

  test("transactions list renders", async ({ page }) => {
    test.todo();
  });

  test("filter by type works", async ({ page }) => {
    test.todo();
  });

  test("delete removes item", async ({ page }) => {
    test.todo();
  });

  test("empty state shown", async ({ page }) => {
    test.todo();
  });
});
