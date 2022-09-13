import { createRouter } from "./context";
import { z } from "zod";

export const routes = createRouter()
  .query("getAllSpots", {
    async resolve({ ctx }) {
      const spots = await ctx.prisma.spot.findMany({
        include: { wings: { select: { rating: true } } },
      });
      return spots.map((spot) => {
        const ratings = spot.wings.map((wing) => wing.rating);
        const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
        const numWings = spot.wings.length;
        const roundedRating =
          numWings > 0 ? Math.ceil(totalRating / numWings) : null;
        const { wings, ...spotData } = spot;
        return { ...spotData, rating: roundedRating, numWings };
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
        select: {
          name: true,
          state: true,
          city: true,
          createdAt: true,
          wings: {
            select: {
              review: true,
              rating: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
              images: {
                select: {
                  key: true,
                  type: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            select: {
              key: true,
              type: true,
            },
          },
        },
      });
      const ratings = spot.wings.map((wing) => wing.rating);
      const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
      const numWings = spot.wings.length;
      const roundedRating =
        numWings > 0 ? Math.ceil(totalRating / numWings) : null;
      return { ...spot, rating: roundedRating, numWings };
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
        select: {
          review: true,
          rating: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          images: {
            select: {
              key: true,
              type: true,
            },
          },
        },
      });
    },
  });
