import { TRPCError } from "@trpc/server";
import { env } from "../../../env/server.mjs";
import { toCloudinaryUrlForIg } from "../../../lib/cloudinary";
import { router, authTokenProtectedProcedure } from "../trpc";
import { IgApiClient } from "instagram-private-api";
import { siteConfig } from "../../../siteConfig";
import { getErrorMessage } from "../../lib/getErrorMessage";

const ig = new IgApiClient();

const loginToInstagram = async () => {
  ig.state.generateDevice(env.IG_USERNAME);
  try {
    ig.simulate.preLoginFlow();
  } catch (e) {
    // ignore
  }
  await ig.account.login(env.IG_USERNAME, env.IG_PASSWORD);
  try {
    await ig.simulate.postLoginFlow();
  } catch (e) {
    // ignore
  }
};

export const socialRouter = router({
  postInstagramPhoto: authTokenProtectedProcedure.query(async ({ ctx }) => {
    const login = loginToInstagram();
    try {
      const type = "ig-post";
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
        return { error: "No wings found without an instagram post." };
      }
      const mainImakeKey = wing.images.find((image) => image.type === "main");
      if (!mainImakeKey) {
        return { error: "No main image found for wing." };
      }
      const otherImageKeys = wing.images.filter(
        (image) => image.type !== "main"
      );
      const imageKeys = [mainImakeKey, ...otherImageKeys];
      const imageUrls = imageKeys.map((image) => {
        return toCloudinaryUrlForIg(image.key);
      });
      const photoArrayBuffers = await Promise.all(
        imageUrls.map((url) => fetch(url).then((res) => res.arrayBuffer()))
      );
      const photoBuffers = photoArrayBuffers.map((buffer) =>
        Buffer.from(buffer)
      );
      const albumPhotoItems = photoBuffers.map((buffer) => ({ file: buffer }));

      if (!wing.spot.place) {
        return { error: "No place found for wing." };
      }
      const { lat, lng, name, city, state } = wing.spot.place;
      await login;
      const locations = await ig.search.location(lat, lng, name);
      const location = locations[0];

      let result: any = null;
      const caption = `Wings from ${name} in ${city}, ${state}. Check out the full review on NakedExtraCrispy! (link in bio)`;
      if (albumPhotoItems.length === 1) {
        result = await ig.publish.photo({
          file: albumPhotoItems[0]?.file!,
          caption,
          location,
        });
      } else {
        result = await ig.publish.album({
          items: albumPhotoItems,
          caption,
          location,
        });
      }

      await ctx.prisma.wingSocialPost.create({
        data: {
          type,
          wingId: wing.id,
        },
      });
      const queryParams = new URLSearchParams();
      queryParams.set("subject", `IG Post Success!`);
      queryParams.set(
        "message",
        `${env.NEXT_PUBLIC_BASE_URL}/wings/${wing.id}`
      );
      fetch(`${siteConfig.sendEmailUrl}?${queryParams}`);
      return result;
    } catch (e) {
      const message = getErrorMessage(e);
      const queryParams = new URLSearchParams();
      queryParams.set("subject", `IG Post Error!`);
      queryParams.set("message", `${message}`);
      fetch(`${siteConfig.sendEmailUrl}?${queryParams}`);
      console.log(message);
      return new TRPCError({
        message: message,
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),
});
