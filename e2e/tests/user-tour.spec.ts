import { test, expect } from "@playwright/test";
import { setupDatabase } from "../setup/setup";

let cleanup: () => Promise<void> = async () => {};

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

for (const route of ["/spots", "/map"]) {
  test(`search input disables browser/password-manager autofill on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);

    const form = page.locator("form", { has: page.locator("#spot-autocomplete") });
    const searchInput = page.locator("#spot-autocomplete");

    await expect(form).toHaveAttribute("autocomplete", "off");
    await expect(form).toHaveAttribute("data-lpignore", "true");

    await expect(searchInput).toHaveAttribute("type", "search");
    await expect(searchInput).toHaveAttribute("autocomplete", "off");
    await expect(searchInput).toHaveAttribute("autocorrect", "off");
    await expect(searchInput).toHaveAttribute("autocapitalize", "none");
    await expect(searchInput).toHaveAttribute("spellcheck", "false");
    await expect(searchInput).toHaveAttribute("name", "spot-search");
    await expect(searchInput).toHaveAttribute("data-lpignore", "true");
    await expect(searchInput).toHaveAttribute("data-1p-ignore", "true");
    await expect(searchInput).toHaveAttribute("data-form-type", "other");
  });
}
