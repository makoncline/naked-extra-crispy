import path from "path";
import { expect, test } from "@playwright/test";
import { setupDatabase } from "../setup/setup";

let cleanup: () => Promise<void> = async () => {};

test.afterEach(async () => {
  await cleanup();
});

test("user can crop and save a main wing image", async ({ page, context }) => {
  const setup = await setupDatabase();
  cleanup = setup.cleanup;

  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: setup.sessionToken,
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.route("https://api.cloudinary.com/v1_1/**/image/upload", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ public_id: "mock-main-image-id" }),
    });
  });

  await page.goto(`/spots/${setup.spot.id}/addWing`);
  await expect(page.getByRole("heading", { name: setup.spot.name })).toBeVisible();

  const uploadPath = path.join(process.cwd(), "public", "mainWing.webp");
  await page.locator("input#main").setInputFiles(uploadPath);

  await expect(page.getByRole("dialog", { name: "Upload Preview" })).toBeVisible();
  await expect(page.getByAltText("Crop preview")).toBeVisible();

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/image/upload") &&
        response.request().method() === "POST"
    ),
    page.getByRole("button", { name: "Looks Good!" }).click(),
  ]);

  await expect(page.locator('input[name="mainImageId"]')).toHaveValue(
    "mock-main-image-id"
  );
  await expect(page.getByAltText("wing image")).toBeVisible();
});

test("failed rating create keeps the user on the add-wing page", async ({
  page,
  context,
}) => {
  const setup = await setupDatabase();
  cleanup = setup.cleanup;

  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: setup.sessionToken,
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.route("https://api.cloudinary.com/v1_1/**/image/upload", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ public_id: "mock-main-image-id" }),
    });
  });

  await page.goto(`/spots/${setup.spot.id}/addWing`);
  await expect(page.getByRole("heading", { name: setup.spot.name })).toBeVisible();

  const uploadPath = path.join(process.cwd(), "public", "mainWing.webp");
  await page.locator("input#main").setInputFiles(uploadPath);
  await page.getByRole("button", { name: "Looks Good!" }).click();
  await expect(page.locator('input[name="mainImageId"]')).toHaveValue(
    "mock-main-image-id"
  );

  await page.route("**/api/trpc/auth.createWing*", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify([
        {
          error: {
            message: "create failed",
            code: -32603,
            data: {
              code: "INTERNAL_SERVER_ERROR",
              httpStatus: 500,
              path: "auth.createWing",
            },
          },
        },
      ]),
    });
  });

  await page.getByRole("button", { name: "8" }).click();
  await page
    .getByRole("textbox", { name: "review" })
    .fill("These wings should not be saved because the mocked create fails.");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(new RegExp(`/spots/${setup.spot.id}/addWing$`));
  await expect(page.getByText("Failed to add rating")).toBeVisible();
  await expect(page.getByRole("heading", { name: setup.spot.name })).toBeVisible();
});
