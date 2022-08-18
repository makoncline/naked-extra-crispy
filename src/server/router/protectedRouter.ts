import { createProtectedRouter } from "./protected-router";
import { z } from "zod";
import { prisma } from "../db/client";
import FormData from "form-data";
import { uploadImage } from "../lib/uploadImage";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedRouter = createProtectedRouter()
  .query("getSession", {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .mutation("createRestaurant", {
    input: z.object({
      userId: z.string(),
      name: z.string(),
      state: z.string().min(1).max(2),
      city: z.string().min(1),
    }),
    async resolve({ input }) {
      const restaurant = await prisma.restaurant.create({
        data: input,
        select: {
          id: true,
          user: true,
          name: true,
          state: true,
          city: true,
          createdAt: true,
        },
      });
      return restaurant;
    },
  })
  .mutation("createReview", {
    input: z.object({
      userId: z.string(),
      restaurantId: z.string(),
      title: z.string(),
      description: z.string(),
      rating: z.preprocess(
        (a) => parseInt(z.string().parse(a), 10),
        z.number().positive().min(1).max(5)
      ),
      mainImage: z.string(),
    }),
    async resolve({ input }) {
      const { mainImage, ...restaurantReview } = input;
      let main: string | undefined = undefined;
      if (input.mainImage) {
        main = await uploadImage(input.mainImage);
      }
      // save the review
      const { id: reviewId } = await prisma.review.create({
        data: restaurantReview,
        select: {
          id: true,
        },
      });

      if (main) {
        console.log("savingImage");
        // save the image
        await prisma.image.create({
          data: {
            userId: input.userId,
            restaurantId: input.restaurantId,
            reviewId: reviewId,
            key: main,
            type: "main",
          },
        });
      }

      const review = await prisma.review.findFirstOrThrow({
        where: { id: reviewId },
        select: {
          id: true,
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
          restaurant: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
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
      return review;
    },
  });
