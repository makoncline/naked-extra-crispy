import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { limitToOneDecimal } from "../../../lib/limitToDecimal";
import { Prisma } from "@prisma/client";

const defaultUserSelect = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    name: true,
  },
});

const defaultImagesSelect = Prisma.validator<Prisma.ImageDefaultArgs>()({
  select: {
    id: true,
    key: true,
    type: true,
  },
});

const defaultWingsSelect = Prisma.validator<Prisma.WingDefaultArgs>()({
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

const defaultSpotDetailSelect = Prisma.validator<Prisma.SpotDefaultArgs>()({
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

const defaultSpotListSelect = Prisma.validator<Prisma.SpotDefaultArgs>()({
  select: {
    id: true,
    name: true,
    state: true,
    city: true,
    place: {
      select: {
        id: true,
        name: true,
        lat: true,
        lng: true,
        address: true,
      },
    },
    images: {
      where: { type: "main" },
      ...defaultImagesSelect,
      orderBy: { createdAt: "desc" },
    },
  },
});

export const publicRouter = router({
  getAllSpots: publicProcedure.query(async ({ ctx }) => {
    const spots = await ctx.prisma.spot.findMany(defaultSpotListSelect);
    const wingStats = await ctx.prisma.wing.groupBy({
      by: ["spotId"],
      _avg: {
        rating: true,
      },
      _count: {
        _all: true,
      },
    });
    const wingStatsBySpotId = new Map(
      wingStats.map((stat) => [stat.spotId, stat] as const)
    );

    return spots.map((spot) => {
      const stat = wingStatsBySpotId.get(spot.id);
      const numWings = stat?._count._all ?? 0;
      const rating =
        stat?._avg.rating != null ? limitToOneDecimal(stat._avg.rating) : 0;
      return { ...spot, rating, numWings };
    });
  }),
  getSpot: publicProcedure
    .input(z.object({ spotId: z.string() }))
    .query(async ({ input, ctx }) => {
      const spot = await ctx.prisma.spot.findFirstOrThrow({
        where: {
          id: input.spotId,
        },
        ...defaultSpotDetailSelect,
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
