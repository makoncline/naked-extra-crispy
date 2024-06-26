import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { limitToOneDecimal } from "../../../lib/limitToDecimal";
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
    spot: {
      select: {
        id: true,
        name: true,
        state: true,
        city: true,
        place: true,
      },
    },
  },
});

const defaultSpotSelect = Prisma.validator<Prisma.SpotArgs>()({
  select: {
    id: true,
    name: true,
    state: true,
    city: true,
    createdAt: true,
    place: true,
    wings: { ...defaultWingsSelect, orderBy: { createdAt: "desc" } },
    user: defaultUserSelect,
    images: {
      where: { type: "main" },
      ...defaultImagesSelect,
      orderBy: { createdAt: "desc" },
    },
  },
});

export const publicRouter = router({
  getAllSpots: publicProcedure.query(async ({ ctx }) => {
    const spots = await ctx.prisma.spot.findMany(defaultSpotSelect);

    return spots.map((spot) => {
      const ratings = spot.wings.map((wing) => wing.rating);
      const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
      const numWings = spot.wings.length;
      const roundedRating =
        numWings > 0 ? limitToOneDecimal(totalRating / numWings) : 0;
      return { ...spot, rating: roundedRating, numWings };
    });
  }),
  getSpot: publicProcedure
    .input(z.object({ spotId: z.string() }))
    .query(async ({ input, ctx }) => {
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
        numWings > 0 ? limitToOneDecimal(totalRating / numWings) : 0;
      return { ...spot, rating: roundedRating, numWings };
    }),
  getSpotName: publicProcedure
    .input(z.object({ spotId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.spot.findFirstOrThrow({
        where: {
          id: input.spotId,
        },
        select: {
          name: true,
        },
      });
    }),
  getAllWings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.wing.findMany({
      ...defaultWingsSelect,
      orderBy: { createdAt: "asc" },
    });
  }),
  getWings: publicProcedure
    .input(z.object({ spotId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.wing.findMany({
        where: {
          spot: {
            id: input.spotId,
          },
        },
        ...defaultWingsSelect,
      });
    }),
  getWing: publicProcedure
    .input(z.object({ wingId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.wing.findFirstOrThrow({
        where: {
          id: input.wingId,
        },
        ...defaultWingsSelect,
      });
    }),
});
