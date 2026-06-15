import { expect, test, type Page } from "@playwright/test";
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

const waitForNameFilter = async (page: Page, name: string) => {
  await expect.poll(() => getNormalizedFiltersFromUrl(page.url()).name).toBe(name);
};

const firstOpenListboxOption = (page: Page, placeholder: string) =>
  page
    .getByRole("listbox")
    .last()
    .getByRole("option")
    .filter({ hasNotText: placeholder })
    .first();

const openSelect = async (page: Page, selector: string) => {
  const trigger = page.locator(selector);
  for (let attempt = 0; attempt < 3; attempt++) {
    await expect(trigger).toBeVisible();
    await trigger.click({ force: true });
    try {
      await expect(page.getByRole("listbox").last()).toBeVisible({
        timeout: 2000,
      });
      return;
    } catch {
      await page.keyboard.press("Escape");
    }
  }
  await trigger.click();
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

    const searchInput = page.getByRole("combobox", { name: "Name" });
    await searchInput.fill("qzxjv-no-match");
    await waitForNameFilter(page, "qzxjv-no-match");

    await openSelect(page, "#state");
    await expect(page.getByRole("listbox").last().getByRole("option")).toHaveCount(1);
    await page.keyboard.press("Escape");

    await searchInput.fill("");
    await expect.poll(() => new URL(page.url()).search).toBe("");
    await openSelect(page, "#state");
    await expect(firstOpenListboxOption(page, "Pick a state")).toBeVisible();
    await firstOpenListboxOption(page, "Pick a state").click();

    await expect.poll(() => getNormalizedFiltersFromUrl(page.url())).toMatchObject({
      city: "",
    });
    await expect.poll(() => getNormalizedFiltersFromUrl(page.url()).state).not.toBe("");
    await expect.poll(() => getNormalizedFiltersFromUrl(page.url()).distance).toBe("any");

    await openSelect(page, "#city");
    await expect(firstOpenListboxOption(page, "Select a city")).toBeVisible();
    await firstOpenListboxOption(page, "Select a city").click();

    await expect.poll(() => getNormalizedFiltersFromUrl(page.url())).toMatchObject({
      state: "",
      distance: "any",
    });
    await expect.poll(() => getNormalizedFiltersFromUrl(page.url()).city).not.toBe("");
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

      await openSelect(page, "#state");
      await expect(firstOpenListboxOption(page, "Pick a state")).toBeVisible();
      await firstOpenListboxOption(page, "Pick a state").click();

      await expect.poll(() => getNormalizedFiltersFromUrl(page.url())).toMatchObject({
        city: "",
        distance: "any",
      });
      await expect.poll(() => getNormalizedFiltersFromUrl(page.url()).state).not.toBe("");

      await openSelect(page, "#distance");
      await page.getByRole("listbox").last().getByRole("option", { name: "10 miles" }).click();

      await expect(page.locator("#distance")).toContainText("10 miles");
      await expect.poll(() => getNormalizedFiltersFromUrl(page.url())).toMatchObject({
        state: "",
        city: "",
      });
    });
  }
});
