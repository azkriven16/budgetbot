import { test } from "@playwright/test";

/**
 * Spec: context/feature-specs/15-ai-eval-harness.md
 * Status: planned
 *
 * Note: The primary tests for this feature are Vitest unit tests in
 * tests/ai/parser.test.ts — those run live Gemini calls against golden inputs.
 * The E2E tests below verify that the extracted parseMessage function is
 * wired correctly into the Trigger.dev task.
 *
 * Replace test.todo() with real assertions when the feature is implemented.
 */

test.describe("15: AI Parser Eval Harness", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("lib/ai/parse.ts exists and is imported by trigger/parse-message.ts", async () => {
    test.todo();
  });

  test("pnpm test:ai script is defined in package.json", async () => {
    test.todo();
  });

  test("eval suite scores at least 8 out of 10 golden cases", async () => {
    test.todo();
  });
});
