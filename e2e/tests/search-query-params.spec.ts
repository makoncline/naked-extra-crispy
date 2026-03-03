import { expect, test } from "@playwright/test";
import { setupDatabase } from "../setup/setup";

let cleanup: () => Promise<void> = async () => {};

const getFiltersFromUrl = (url: string) => {
  const filters = new URL(url).searchParams.get("filters");
  if (!filters) {
    return null;
  }

  try {
    return JSON.parse(filters) as {
      name?: string;
      state?: string;
      city?: string;
      distance?: string;
    };
  } catch {
    return null;
  }
};

const getNormalizedFiltersFromUrl = (url: string) => {
  const filters = getFiltersFromUrl(url);
  return {
    name: filters?.name ?? "",
    state: filters?.state ?? "",
    city: filters?.city ?? "",
    distance: filters?.distance ?? "any",
  };
};

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

  test(`location filters are mutually exclusive and state options are result-backed on ${route}`, async ({
    page,
  }) => {
    await page.goto(route);

    await page.locator("#state").click();
    await expect(page.getByRole("option", { name: "Colorado" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Alaska" })).toHaveCount(0);
    await page.getByRole("option", { name: "Colorado" }).click();

    await expect.poll(() => getNormalizedFiltersFromUrl(page.url())).toMatchObject({
      state: "CO",
      city: "",
      distance: "any",
    });

    await page.locator("#city").click();
    await page.getByRole("option", { name: "Denver" }).click();

    await expect.poll(() => getNormalizedFiltersFromUrl(page.url())).toMatchObject({
      state: "",
      city: "Denver",
      distance: "any",
    });
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

  for (const route of ["/spots", "/map"]) {
    test(`distance and state filters are mutually exclusive on ${route}`, async ({
      page,
    }) => {
      await page.goto(route);

      await expect(page.locator("#distance")).toBeVisible();

      await page.locator("#state").click();
      await page.getByRole("option", { name: "Colorado" }).click();

      await expect.poll(() => getNormalizedFiltersFromUrl(page.url())).toMatchObject({
        state: "CO",
        city: "",
        distance: "any",
      });

      await page.locator("#distance").click();
      await page.getByRole("option", { name: "10 miles" }).click();

      await expect(page.locator("#distance")).toContainText("10 miles");
      await expect.poll(() => getNormalizedFiltersFromUrl(page.url())).toMatchObject({
        state: "",
        city: "",
      });
    });
  }
});
