import path from "path";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { setupDatabase } from "../setup/setup";

let cleanup: () => Promise<void> = async () => {};

test.afterEach(async () => {
  await cleanup();
});

const openAddWingPage = async ({
  page,
  context,
  mobile = false,
}: {
  page: Page;
  context: BrowserContext;
  mobile?: boolean;
}) => {
  const setup = await setupDatabase();
  cleanup = setup.cleanup;

  if (mobile) {
    await page.setViewportSize({ width: 390, height: 844 });
  }

  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: setup.sessionToken,
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto(`/spots/${setup.spot.id}/addWing`);
  await expect(page.getByRole("heading", { name: setup.spot.name })).toBeVisible();
};

test("rating controls fit on one row on mobile", async ({ page, context }) => {
  await openAddWingPage({ page, context, mobile: true });
  const ratingButtons = page.getByRole("button", { name: /Rate \d+ out of 10/ });
  await expect(ratingButtons).toHaveCount(10);

  const firstBox = await ratingButtons.first().boundingBox();
  const lastBox = await ratingButtons.nth(9).boundingBox();

  expect(firstBox).not.toBeNull();
  expect(lastBox).not.toBeNull();
  expect(Math.abs((firstBox?.y ?? 0) - (lastBox?.y ?? 0))).toBeLessThan(2);
});

test("user can crop and save a main wing image", async ({ page, context }) => {
  await page.route("https://api.cloudinary.com/v1_1/**/image/upload", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ public_id: "mock-main-image-id" }),
    });
  });

  await openAddWingPage({ page, context });

  const uploadPath = path.join(process.cwd(), "public", "mainWing.webp");
  await page.locator("input#main").setInputFiles(uploadPath);

  await expect(page.getByRole("dialog", { name: "Upload Preview" })).toBeVisible();
  await expect(page.getByAltText("Crop preview")).toBeVisible();

  const uploadResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/image/upload") &&
      response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Looks Good!" }).click();

  await expect(page.getByRole("button", { name: "Uploading" })).toBeDisabled();
  await expect(page.getByRole("status", { name: "Loading" })).toHaveCount(1);
  await expect(page.getByRole("progressbar", { name: "Upload progress" }))
    .toBeVisible();
  await expect(page.getByAltText("wing image")).toHaveCount(0);

  await uploadResponse;

  await expect(page.locator('input[name="mainImageId"]')).toHaveValue(
    "mock-main-image-id"
  );
  await expect(page.getByAltText("wing image")).toBeVisible();
});

test("user sees a generic error when Cloudinary rejects the upload", async ({
  page,
  context,
}) => {
  await page.route(
    "https://api.cloudinary.com/v1_1/**/image/upload",
    async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: { message: "Upload preset must be whitelisted for unsigned uploads" },
        }),
      });
    }
  );

  await openAddWingPage({ page, context });

  const uploadPath = path.join(process.cwd(), "public", "mainWing.webp");
  await page.locator("input#main").setInputFiles(uploadPath);

  await expect(page.getByRole("dialog", { name: "Upload Preview" })).toBeVisible();

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/image/upload") &&
        response.request().method() === "POST"
    ),
    page.getByRole("button", { name: "Looks Good!" }).click(),
  ]);

  await expect(
    page.getByText("There was a problem uploading the image. Try again later.")
  ).toBeVisible();
  await expect(
    page.getByText("Upload preset must be whitelisted for unsigned uploads")
  ).toHaveCount(0);
  await expect(page.locator('input[name="mainImageId"]')).toHaveValue("");
});
