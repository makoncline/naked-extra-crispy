import { expect, test } from "@playwright/test";
import { appRouter } from "../../src/server/trpc/router/_app";
import { createContextInner } from "../../src/server/trpc/context";
import { setupOtherUserSessionDatabase } from "../setup/setup";

let cleanup: () => Promise<void> = async () => {};

test.afterEach(async () => {
  await cleanup();
});

test("create mutations use the session user as owner", async () => {
  const setup = await setupOtherUserSessionDatabase();
  cleanup = setup.cleanup;

  const caller = appRouter.createCaller(
    await createContextInner({
      session: {
        expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        user: {
          id: setup.otherUser.id,
          name: setup.otherUser.name,
          email: setup.otherUser.email,
        },
      },
    })
  );

  const createdSpot = await caller.auth.createSpot({
    name: "Session Owned Spot",
    city: "Session City",
    state: "CO",
    placeId: `place-${setup.otherUser.id}`,
    lat: 39.7392,
    lng: -104.9903,
    address: "123 Session St, Denver, CO",
  });

  const spot = await caller.public.getSpot({ spotId: createdSpot.id });
  expect(spot.user.id).toBe(setup.otherUser.id);

  const wing = await caller.auth.createWing({
    spotId: setup.spot.id,
    review: "Session-owned rating with a real enough review for integration coverage.",
    rating: 8,
    mainImageId: "session-main-image",
    drumImageId: null,
    flatImageId: null,
  });

  expect(wing.user.id).toBe(setup.otherUser.id);

  const fetchedWing = await caller.public.getWing({ wingId: wing.id });
  expect(fetchedWing.user.id).toBe(setup.otherUser.id);
});
