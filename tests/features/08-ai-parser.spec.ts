import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/08-ai-parser.md
 * Status: planned
 */

test.describe("08: AI Message Parser", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
  });

  test("expense message parsed", async ({ page }) => {
    test.todo();
  });

  test("income message parsed", async ({ page }) => {
    test.todo();
  });

  test("unknown message handled", async ({ page }) => {
    test.todo();
  });

  test("messages saved to chat history", async ({ page }) => {
    test.todo();
  });
});
