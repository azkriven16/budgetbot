import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/14-reminders.md
 * Status: planned
 */

test.describe("14: Reminders", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
  });

  test("reminder created via chat", async ({ page }) => {
    test.todo();
  });

  test("due reminder appears in chat", async ({ page }) => {
    test.todo();
  });

  test("reminder reschedules", async ({ page }) => {
    test.todo();
  });

  test("delete deactivates reminder", async ({ page }) => {
    test.todo();
  });
});
