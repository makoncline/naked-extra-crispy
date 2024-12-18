import { test, expect } from "@playwright/test";
import { setupDatabase } from "../setup/setup";

let cleanup: () => Promise<void>;

test.beforeEach(async () => {
  const setup = await setupDatabase();
  cleanup = setup.cleanup;
});

test.afterEach(async () => {
  await cleanup();
});

test("user can view the homepage", async ({ page }) => {
  await page.goto("/");

  // Check page title
  await expect(page).toHaveTitle(/Naked Extra Crispy/);

  // Check main heading
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText(/Naked Extra Crispy/);

  // Check subheading
  const subheading = page.getByText("A site for wing enthusiasts");
  await expect(subheading).toBeVisible();
});
