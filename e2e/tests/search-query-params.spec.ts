import { expect, test } from "@playwright/test";
import { setupDatabase } from "../setup/setup";

let cleanup: () => Promise<void> = async () => {};

test.beforeEach(async () => {
  const setup = await setupDatabase();
  cleanup = setup.cleanup;
});

test.afterEach(async () => {
  await cleanup();
});

for (const route of ["/spots", "/map"]) {
  test(`search query params only include non-default values on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);

    await expect.poll(() => new URL(page.url()).search).toBe("");

    const searchInput = page.getByRole("combobox", { name: "Name" });
    await searchInput.fill("zzzz");

    await expect.poll(() => {
      const filters = new URL(page.url()).searchParams.get("filters");
      if (!filters) {
        return undefined;
      }
      try {
        return (JSON.parse(filters) as { name?: string }).name;
      } catch {
        return undefined;
      }
    }).toBe("zzzz");
    await expect
      .poll(() => new URL(page.url()).searchParams.has("sortBy"))
      .toBeFalsy();
    await expect
      .poll(() => new URL(page.url()).searchParams.has("reverse"))
      .toBeFalsy();

    await searchInput.fill("");
    await expect.poll(() => new URL(page.url()).search).toBe("");
  });
}

test.describe("nearby defaults", () => {
  test.use({
    permissions: ["geolocation"],
    geolocation: { latitude: 39.7392, longitude: -104.9903 },
  });

  test("auto-enabled nearby defaults do not pollute the url", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#distance")).toBeVisible();
    await expect.poll(() => new URL(page.url()).search).toBe("");
  });
});
