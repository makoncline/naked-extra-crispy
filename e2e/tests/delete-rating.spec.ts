import { test, expect } from "@playwright/test";
import { setupDatabase, setupOtherUserSessionDatabase } from "../setup/setup";

let cleanup: () => Promise<void> = async () => {};

test.afterEach(async () => {
  await cleanup();
});

test("rating creator can delete from the rating page", async ({
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

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.goto(`/wings/${setup.wing.id}`);
  const deleteButton = page.getByRole("button", { name: "Delete rating" });
  await expect(deleteButton).toBeVisible();

  const deleteResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/api/trpc/auth.deleteWing") &&
      response.request().method() === "POST"
  );
  await deleteButton.click();
  const deleteResponse = await deleteResponsePromise;
  expect(deleteResponse.status()).toBe(200);
});

test("non-creator does not see delete on the rating page", async ({
  page,
  context,
}) => {
  const setup = await setupOtherUserSessionDatabase();
  cleanup = setup.cleanup;

  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: setup.sessionToken,
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto(`/wings/${setup.wing.id}`);

  await expect(
    page.getByRole("button", { name: "Delete rating" })
  ).toHaveCount(0);
});
