import { TRPCError } from "@trpc/server";
import { env } from "../../../env/server.mjs";
import { toCloudinaryUrlForIg } from "../../../lib/cloudinary";
import { router, authTokenProtectedProcedure } from "../trpc";
import { siteConfig } from "../../../siteConfig";
import { getErrorMessage } from "../../lib/getErrorMessage";
import { z } from "zod";

const socialPostTypes = ["ig-post", "ig-story"] as const;
export const socialPostTypeSchema = z.enum(socialPostTypes);

export const socialRouter = router({
  getNextWingSocialPostData: authTokenProtectedProcedure
    .input(z.object({ type: socialPostTypeSchema }))
    .query(async ({ ctx, input }) => {
      const { type } = input;
      const wing = await ctx.prisma.wing.findFirst({
        where: {
          socialPosts: {
            none: {
              type: type,
            },
          },
        },
        select: {
          id: true,
          images: {
            select: {
              key: true,
              type: true,
            },
          },
          spot: {
            select: {
              name: true,
              place: {
                select: {
                  name: true,
                  city: true,
                  state: true,
                  lat: true,
                  lng: true,
                },
              },
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      if (!wing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No nextPostData found.",
        });
      }
      const mainImage = wing.images.find((image) => image.type === "main");
      if (!mainImage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No main image found for wing ${wing.id}.`,
        });
      }
      const drumImage = wing.images.find((image) => image.type === "drum");
      const flatImage = wing.images.find((image) => image.type === "flat");
      const images = {
        main: toCloudinaryUrlForIg(mainImage.key),
        drum: drumImage ? toCloudinaryUrlForIg(drumImage.key) : null,
        flat: flatImage ? toCloudinaryUrlForIg(flatImage.key) : null,
      };
      if (!wing.spot.place) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `No place data found for wing ${wing.id}.`,
        });
      }
      const { lat, lng, name, city, state } = wing.spot.place;

      return {
        id: wing.id,
        name,
        city,
        state,
        caption: getRandomCaption(name, city, state),
        images,
        lat,
        lng,
      };
    }),
  markPosted: authTokenProtectedProcedure
    .input(
      z.object({
        type: socialPostTypeSchema,
        wingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { type, wingId } = input;
      await ctx.prisma.wingSocialPost.create({
        data: {
          type,
          wingId,
        },
      });
      return { success: true };
    }),
});

const getRandomCaption = (name: string, city: string, state: string) => {
  const emojiOptions = ["🍗", "🔥", "😍", "👀", "🤤"];
  const getRandomEmoji = () => {
    return emojiOptions[Math.floor(Math.random() * emojiOptions.length)];
  };

  const captionFormats = [
    `Have you tried the wings at ${name} in ${city}, ${state}? ${getRandomEmoji()} Check out our review on NakedExtraCrispy! (link in bio)`,
    `Where can you find the best wings in ${city}, ${state}? We tried them at ${name} and have the full scoop on NakedExtraCrispy. (link in bio) ${getRandomEmoji()}`,
    `Are you a fan of wings? is ${name} in ${city}, ${state} is a must-try? Head to NakedExtraCrispy for our review! (link in bio)`,
    `Looking for the perfect place to satisfy your wing craving? Maybe it's at ${name} in ${city}, ${state}. Check out our review on NakedExtraCrispy. (link in bio)`,
    `${getRandomEmoji()} Craving wings? Can't stop thinking about the ones we had at ${name} in ${city}, ${state}? Head to NakedExtraCrispy for the full review. (link in bio)`,
    `Have you been to ${name} in ${city}, ${state}? Are their wings are a game-changer? ${getRandomEmoji()} We've got the full scoop on NakedExtraCrispy. (link in bio)`,
    `Do you know where to find the crispiest, juiciest wings in ${city}, ${state}? We might. Check out our review of ${name} on NakedExtraCrispy. (link in bio)`,
    `${getRandomEmoji()} Craving wings but don't know where to go? We've got you covered. Check out our review of ${name} in ${city}, ${state} on NakedExtraCrispy. (link in bio)`,
    `Have you checked out the wing scene in ${city}, ${state}? ${getRandomEmoji()} If not, maybe start with ${name}. Our review on NakedExtraCrispy has all the details. (link in bio)`,
    `Looking for a spot to satisfy your wing craving? Swing by ${name} in ${city}, ${state}. Our review on NakedExtraCrispy has all the deets! (link in bio) ${getRandomEmoji()}`,
    `Want to switch up your wing game? Check out ${name} in ${city}, ${state}. Our review on NakedExtraCrispy will give you the inside scoop. (link in bio)`,
    `Feeling adventurous? Give the wings at ${name} in ${city}, ${state} a try. We've got the full review on NakedExtraCrispy! (link in bio) ${getRandomEmoji()}`,
    `Are you a wing fanatic? Don't miss out on the experience at ${name} in ${city}, ${state}. Head to NakedExtraCrispy for our review. (link in bio)`,
    `Ready for a wing-tastic experience? Swing by ${name} in ${city}, ${state}. Our review on NakedExtraCrispy has all the juicy details! (link in bio) ${getRandomEmoji()}`,
    `Craving some wings? Check out our review of ${name} in ${city}, ${state} on NakedExtraCrispy to see if they hit the spot! (link in bio) ${getRandomEmoji()}`,
    `Are you a wing lover? Try out the wings at ${name} in ${city}, ${state}. Check out our review on NakedExtraCrispy for the full scoop! (link in bio)`,
    `Looking for a spot to grab some wings? Give ${name} in ${city}, ${state} a go. Our review on NakedExtraCrispy will give you the rundown. (link in bio)`,
    `Want to try something new? Check out the wings at ${name} in ${city}, ${state}. Our review on NakedExtraCrispy will tell you what to expect. (link in bio) ${getRandomEmoji()}`,
    `Ready for a wing adventure? Try the wings at ${name} in ${city}, ${state}. Our review on NakedExtraCrispy has all the details you need. (link in bio) ${getRandomEmoji()}`,
    `Looking for a new spot to try in ${city}, ${state}? Don't miss out on the wings at ${name}! Our review on NakedExtraCrispy has all the details. (link in bio) ${getRandomEmoji()}`,
    `Ready to spice up your wing game? ${name} in ${city}, ${state} could be the spot. Our review on NakedExtraCrispy has all the juicy details. (link in bio)`,
    `Wing lovers, unite! has ${name} in ${city}, ${state} has got you covered? Check out our review on NakedExtraCrispy to see why. (link in bio)`,
    `Crispy or saucy? Why not both? That's what you'll find at ${name} in ${city}, ${state}. Check out our review on NakedExtraCrispy. (link in bio)`,
    `Wing connoisseurs, have you tried the offerings at ${name} in ${city}, ${state}? If not, you're missing out. Check out our review on NakedExtraCrispy. (link in bio)`,
    `Ready to take your taste buds on a journey? Head to ${name} in ${city}, ${state} for a wing experience you won't forget. Our review on NakedExtraCrispy has all the details. (link in bio)`,
    `Looking for a spot to watch the game and enjoy some wings? Check out ${name} in ${city}, ${state}. Our review on NakedExtraCrispy has all the info you need. (link in bio)`,
    `Are you in the mood for something hot and crispy? Head to ${name} in ${city}, ${state} and try their wings. Our review on NakedExtraCrispy has all the details. (link in bio)`,
  ];

  const getRandomCaptionFormat = () => {
    return captionFormats[Math.floor(Math.random() * captionFormats.length)];
  };

  return getRandomCaptionFormat() as string;
};
