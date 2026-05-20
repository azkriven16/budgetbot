import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/06-transaction-api.md
 * Status: planned
 */

test.describe("06: Transaction API", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("create transaction updates balance", async ({ page }) => {
    test.todo();
  });

  test("unauthenticated request rejected", async ({ page }) => {
    test.todo();
  });

  test("delete reverses balance", async ({ page }) => {
    test.todo();
  });

  test("list returns user-scoped data", async ({ page }) => {
    test.todo();
  });
});
