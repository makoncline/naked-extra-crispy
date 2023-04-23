import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { siteConfig } from "../../../siteConfig";
import { env } from "../../../env/server.mjs";
import { addSpotInputSchema } from "../../../components/AddSpotForm";
import { Image } from "@prisma/client";

export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  createSpot: protectedProcedure
    .input(addSpotInputSchema)
    .mutation(async ({ input, ctx }) => {
      const { placeId, lat, lng, name, city, state, userId, address } = input;
      try {
        const spot = await ctx.prisma.spot.create({
          data: {
            userId,
            name: input.name.trim(),
            city: input.city.trim(),
            state,
            place: {
              create: {
                id: placeId,
                lat,
                lng,
                name,
                city,
                state,
                address,
              },
            },
          },
          select: {
            id: true,
            user: true,
            name: true,
            state: true,
            city: true,
          },
        });
        try {
          // send myself an email
          const message = `
            ${spot.name}<br>
            ${spot.city}, ${spot.state}<br>
            added by ${spot.user.name || spot.user.email}<br>
            ${env.NEXT_PUBLIC_BASE_URL}/spots/${spot.id}
            `;
          const queryParams = new URLSearchParams();
          queryParams.set("subject", `New Spot!`);
          queryParams.set("message", message);
          fetch(`${siteConfig.sendEmailUrl}?${queryParams}`);
        } catch (e) {
          // ignore
        }
        return { id: spot.id };
      } catch (e: any) {
        const genericError = new Error(
          "Oops! Something went wrong. Please try again later."
        );
        if (e.code === "P2002") {
          // if the sport already exists, find the existing spot and return it
          const spotAlreadyExists = await ctx.prisma.spot
            .findFirstOrThrow({
              where: {
                place: {
                  id: placeId,
                },
              },
              select: {
                id: true,
              },
            })
            .catch((e) => {
              throw genericError;
            });
          return spotAlreadyExists;
        } else {
          throw genericError;
        }
      }
    }),
  createWing: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        spotId: z.string(),
        review: z.string(),
        rating: z.number().positive().min(1).max(10),
        mainImageId: z.string(),
        drumImageId: z.string().nullable(),
        flatImageId: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { mainImageId, drumImageId, flatImageId, ...wingReview } = input;
      const { userId, spotId } = wingReview;
      const baseImageData = { userId, spotId };
      let images = [
        {
          ...baseImageData,
          key: mainImageId,
          type: "main",
        },
      ];
      if (drumImageId) {
        images.push({
          ...baseImageData,
          key: drumImageId,
          type: "drum",
        });
      }
      if (flatImageId) {
        images.push({
          ...baseImageData,
          key: flatImageId,
          type: "flat",
        });
      }
      const wing = await ctx.prisma.wing.create({
        data: {
          ...wingReview,
          images: {
            create: images,
          },
        },
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
        // send myself an email
        const message = `
          ${wing.spot.name}<br>
          ${wing.spot.city}, ${wing.spot.state}<br>
          added by ${wing.user.name || wing.user.email}<br>
          ${wing.rating}/10 🔥<br>
          ${wing.review}<br>
          ${env.NEXT_PUBLIC_BASE_URL}/wings/${wing.id}
        `;
        const queryParams = new URLSearchParams();
        queryParams.set("subject", `New Rating!`);
        queryParams.set("message", message);
        fetch(`${siteConfig.sendEmailUrl}?${queryParams}`);
      } catch (e) {
        // ignore
      }
      return wing;
    }),
});
