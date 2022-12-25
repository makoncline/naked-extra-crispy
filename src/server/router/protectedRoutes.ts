import { createProtectedRouter } from "./protected-router";
import { z } from "zod";
import { prisma } from "../db/client";
import { siteConfig } from "../../siteConfig";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedRoutes = createProtectedRouter()
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
        data: {
          ...input,
          name: input.name.trim(),
          city: input.city.trim(),
        },
        select: {
          id: true,
          user: true,
          name: true,
          state: true,
          city: true,
          createdAt: true,
        },
      });
      try {
        const message = `%0a
        New spot added by ${spot.user.name || spot.user.email}: %0a
        ${spot.name} %0a
        ${spot.city}, ${spot.state} %0a
        ${siteConfig.baseUrl}/spots/${spot.id}`;
        fetch(`${siteConfig.sendTextUrl}?message=${message}`);
      } catch (e) {
        // ignore
      }
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
      const baseImageData = { userId, spotId, wingId };

      if (mainImageId) {
        await prisma.image.create({
          data: {
            ...baseImageData,
            key: mainImageId,
            type: "main",
          },
        });
      }
      if (drumImageId) {
        await prisma.image.create({
          data: {
            ...baseImageData,
            key: drumImageId,
            type: "drum",
          },
        });
      }
      if (flatImageId) {
        await prisma.image.create({
          data: {
            ...baseImageData,
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
              email: true,
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
      try {
        const message = `%0a
        New wing added by ${wing.user.name || wing.user.email}: %0a
        ${wing.spot.name} %0a
        ${wing.spot.city}, ${wing.spot.state} %0a
        ${wing.rating}/10 %0a
        ${wing.review} %0a
        ${siteConfig.baseUrl}/spots/${wing.spot.id}#${wing.id}
        `;
        fetch(
          `https://send-to-makon.vercel.app/api/send-text?message=${message}`
        );
      } catch (e) {
        // ignore
      }
      return wing;
    },
  });
