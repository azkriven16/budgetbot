import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/01-design-system.md
 * Status: planned
 */

test.describe("01: Design System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("tokens render correctly", async ({ page }) => {
    test.todo();
  });

  test("fonts load", async ({ page }) => {
    test.todo();
  });

  test("income and expense colors", async ({ page }) => {
    test.todo();
  });
});
