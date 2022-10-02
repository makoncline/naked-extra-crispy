import { createRouter } from "./context";
import { z } from "zod";

export const routes = createRouter()
  .query("getAllSpots", {
    async resolve({ ctx }) {
      const spots = await ctx.prisma.spot.findMany({
        select: {
          id: true,
          name: true,
          state: true,
          city: true,
          createdAt: true,
          wings: {
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
              images: {
                select: {
                  id: true,
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
              id: true,
              key: true,
              type: true,
            },
          },
        },
      });

      return spots.map((spot) => {
        const images = spot.wings.flatMap((wing) => wing.images);
        const ratings = spot.wings.map((wing) => wing.rating);
        const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
        const numWings = spot.wings.length;
        const roundedRating =
          numWings > 0 ? Math.ceil(totalRating / numWings) : 0;
        return { ...spot, rating: roundedRating, numWings, images };
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
          id: true,
          name: true,
          state: true,
          city: true,
          createdAt: true,
          wings: {
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
              images: {
                select: {
                  id: true,
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
              id: true,
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
