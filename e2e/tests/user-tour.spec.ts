import { test, expect } from "@playwright/test";
import { setupDatabase } from "../setup/setup";

let cleanup: () => Promise<void> = async () => {};
let spotId = "";

test.beforeEach(async () => {
  const setup = await setupDatabase();
  cleanup = setup.cleanup;
  spotId = setup.spot.id;
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

test("catch-all API routes return JSON", async ({ request }) => {
  const sessionResponse = await request.get("/api/auth/session");
  expect(sessionResponse.status()).toBe(200);
  expect(sessionResponse.headers()["content-type"]).toContain("application/json");
  expect(await sessionResponse.json()).toEqual({});

  const spotsResponse = await request.get("/api/trpc/public.getAllSpots");
  expect(spotsResponse.status()).toBe(200);
  expect(spotsResponse.headers()["content-type"]).toContain("application/json");
});

test("spot detail hydrates with a stable date", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    timezoneId: "America/Denver",
  });
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  try {
    const sessionResponse = page.waitForResponse("**/api/auth/session");
    await page.goto(`/spots/${spotId}`);
    await sessionResponse;

    await expect(page.getByText("3/6/2023")).toBeVisible();
    expect(
      consoleErrors.filter(
        (message) =>
          message.includes("Minified React error #418") ||
          message.toLowerCase().includes("hydration")
      )
    ).toEqual([]);
  } finally {
    await context.close();
  }
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
