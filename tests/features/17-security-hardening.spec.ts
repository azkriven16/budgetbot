import { test } from "@playwright/test";

/**
 * Spec: context/feature-specs/17-security-hardening.md
 * Status: planned
 *
 * Each test below maps to an acceptance criterion in the spec.
 * Replace test.todo() with real assertions when the feature is implemented.
 */

test.describe("17: Security Hardening", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: sign in as test user before each test
    await page.goto("/");
  });

  test("rate limit triggers on 6th chat request within 60 seconds", async ({ page }) => {
    test.todo();
  });

  test("message longer than 2000 characters returns 400", async ({ page }) => {
    test.todo();
  });

  test("deleting another user's transaction returns 403", async ({ page }) => {
    test.todo();
  });

  test("deleting another user's reminder returns 403", async ({ page }) => {
    test.todo();
  });

  test("creating an 11th active reminder returns 422", async ({ page }) => {
    test.todo();
  });
});
