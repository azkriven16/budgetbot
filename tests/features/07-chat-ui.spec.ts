import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/07-chat-ui.md
 * Status: planned
 */

test.describe("07: Chat Interface UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
  });

  test("message sends on enter", async ({ page }) => {
    test.todo();
  });

  test("input disables while pending", async ({ page }) => {
    test.todo();
  });

  test("auto-scroll on new message", async ({ page }) => {
    test.todo();
  });

  test("welcome message visible", async ({ page }) => {
    test.todo();
  });
});
