import { createRouter } from "./context";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const defaultUserSelect = Prisma.validator<Prisma.UserArgs>()({
  select: {
    id: true,
    name: true,
  },
});

const defaultImagesSelect = Prisma.validator<Prisma.ImageArgs>()({
  select: {
    id: true,
    key: true,
    type: true,
  },
});

const defaultWingsSelect = Prisma.validator<Prisma.WingArgs>()({
  select: {
    id: true,
    review: true,
    rating: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        name: true,
      },
    },
    images: { ...defaultImagesSelect, orderBy: { createdAt: "asc" } },
  },
});

const defaultSpotSelect = Prisma.validator<Prisma.SpotArgs>()({
  select: {
    id: true,
    name: true,
    state: true,
    city: true,
    createdAt: true,
    wings: { ...defaultWingsSelect, orderBy: { createdAt: "desc" } },
    user: defaultUserSelect,
    images: {
      where: { type: "main" },
      ...defaultImagesSelect,
      orderBy: { createdAt: "desc" },
    },
  },
});

export const routes = createRouter()
  .query("getAllSpots", {
    async resolve({ ctx }) {
      const spots = await ctx.prisma.spot.findMany(defaultSpotSelect);

      return spots.map((spot) => {
        const ratings = spot.wings.map((wing) => wing.rating);
        const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
        const numWings = spot.wings.length;
        const roundedRating =
          numWings > 0 ? Math.ceil(totalRating / numWings) : 0;
        return { ...spot, rating: roundedRating, numWings };
      });
    },
  })
  .query("getSpot", {
    input: z.object({
      spotId: z.string(),
    }),
    async resolve({ input, ctx }) {
      const spot = await ctx.prisma.spot.findFirstOrThrow({
        where: {
          id: input.spotId,
        },
        ...defaultSpotSelect,
      });
      const ratings = spot.wings.map((wing) => wing.rating);
      const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
      const numWings = spot.wings.length;
      const roundedRating =
        numWings > 0 ? Math.ceil(totalRating / numWings) : 0;
      return { ...spot, rating: roundedRating, numWings };
    },
  })
  .query("getSpotName", {
    input: z.object({
      spotId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.spot.findFirstOrThrow({
        where: {
          id: input.spotId,
        },
        select: {
          name: true,
        },
      });
    },
  })
  .query("getWings", {
    input: z.object({
      spotId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.wing.findMany({
        where: {
          spot: {
            id: input.spotId,
          },
        },
        ...defaultWingsSelect,
      });
    },
  });
