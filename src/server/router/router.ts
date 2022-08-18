import { createRouter } from "./context";
import { z } from "zod";

export const router = createRouter()
  .query("hello", {
    input: z
      .object({
        text: z.string().nullish(),
      })
      .nullish(),
    resolve({ input }) {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    },
  })
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.example.findMany();
    },
  })
  .query("getAllRestaurants", {
    async resolve({ ctx }) {
      return await ctx.prisma.restaurant.findMany();
    },
  })
  .query("getReviews", {
    input: z.object({
      restaurantId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.review.findMany({
        where: {
          restaurant: {
            id: input.restaurantId,
          },
        },
        select: {
          title: true,
          description: true,
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
