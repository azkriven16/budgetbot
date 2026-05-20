import { test, expect } from "@playwright/test";

/**
 * Spec: context/feature-specs/02-auth.md
 * Status: implemented
 */

test.describe("02: Authentication", () => {
  test("unauthenticated redirect — /dashboard redirects to /sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in page renders Clerk component", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("form")).toBeVisible();
  });

  test("authenticated redirect — signed-in user on /sign-in goes to /dashboard", async ({
    page,
  }) => {
    test.todo();
  });
});
