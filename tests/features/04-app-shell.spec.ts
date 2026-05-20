import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/04-app-shell.md
 * Status: planned
 */

test.describe("04: App Shell & Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("bottom nav visible on mobile", async ({ page }) => {
    test.todo();
  });

  test("sidebar visible on desktop", async ({ page }) => {
    test.todo();
  });

  test("nav links work", async ({ page }) => {
    test.todo();
  });

  test("active state highlights", async ({ page }) => {
    test.todo();
  });
});
