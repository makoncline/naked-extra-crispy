import { createProtectedRouter } from "./protected-router";
import { z } from "zod";
import { prisma } from "../db/client";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedRouter = createProtectedRouter()
  .query("getSession", {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .mutation("createSpot", {
    input: z.object({
      userId: z.string(),
      name: z.string(),
      state: z.string().min(1).max(2),
      city: z.string().min(1),
    }),
    async resolve({ input }) {
      const spot = await prisma.spot.create({
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
      return spot;
    },
  })
  .mutation("createWing", {
    input: z.object({
      userId: z.string(),
      spotId: z.string(),
      review: z.string(),
      rating: z.number().positive().min(1).max(10),
      mainImageId: z.string(),
      drumImageId: z.string().nullable(),
      flatImageId: z.string().nullable(),
    }),
    async resolve({ input }) {
      const { mainImageId, drumImageId, flatImageId, ...wingReview } = input;
      const { id: wingId } = await prisma.wing.create({
        data: wingReview,
        select: {
          id: true,
        },
      });
      const { userId, spotId } = wingReview;

      if (mainImageId) {
        await prisma.image.create({
          data: {
            userId,
            spotId,
            wingId,
            key: mainImageId,
            type: "main",
          },
        });
      }
      if (drumImageId) {
        await prisma.image.create({
          data: {
            userId,
            spotId,
            wingId,
            key: drumImageId,
            type: "drum",
          },
        });
      }
      if (flatImageId) {
        await prisma.image.create({
          data: {
            userId,
            spotId,
            wingId,
            key: flatImageId,
            type: "flat",
          },
        });
      }
      const wing = await prisma.wing.findFirstOrThrow({
        where: { id: wingId },
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
          spot: {
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
      return wing;
    },
  });
