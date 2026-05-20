import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/09-wire-chat.md
 * Status: planned
 */

test.describe("09: Wire Chat to Transactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
  });

  test("end-to-end expense flow", async ({ page }) => {
    test.todo();
  });

  test("chat history loads on mount", async ({ page }) => {
    test.todo();
  });

  test("typing indicator shows", async ({ page }) => {
    test.todo();
  });

  test("failed parse shows error", async ({ page }) => {
    test.todo();
  });
});
