import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/05-dashboard.md
 * Status: planned
 */

test.describe("05: Dashboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("balance card renders", async ({ page }) => {
    test.todo();
  });

  test("empty state for new user", async ({ page }) => {
    test.todo();
  });

  test("charts render", async ({ page }) => {
    test.todo();
  });

  test("recent transactions list", async ({ page }) => {
    test.todo();
  });
});
