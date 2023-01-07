import type {
  GetStaticPaths,
  GetStaticProps,
  NextPage,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import React from "react";
import { trpc } from "../../../utils/trpc";
import Error from "next/error";
import { Loading } from "../../../components/Loading";
import Link from "next/link";
import { Layout } from "../../../components/Layout";
import { Space } from "../../../components/Space";
import { col, row } from "../../../styles/utils";
import { ImageDisplay } from "../../../components/ImageDisplay";
import { Rating } from "../../../components/Rating";
import { Card } from "../../../components/Card";
import { WingsDisplay } from "../../../components/WingsDisplay";
import { NextSeo } from "next-seo";
import { toCloudinaryUrl } from "../../../lib/cloudinary";
import { siteConfig } from "../../../siteConfig";
import { prisma } from "../../../server/db/client";
import { appRouter } from "../../../server/trpc/router/_app";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createContextInner } from "../../../server/trpc/context";
import superjson from "superjson";

const Spot = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { id: spotId } = props;
  const { data: spot, isLoading } = trpc.public.getSpot.useQuery({ spotId });
  if (isLoading) {
    return <Loading />;
  }
  if (!spot) {
    return <Error statusCode={404} />;
  }
  const { name, wings } = spot;
  const titlePartTwo = spot.place
    ? `${spot.place.city}, ${spot.place.state}`
    : siteConfig.title;
  const title = `${name} - ${titlePartTwo}`;
  const description = `Check out reviews and photos of wings from ${name}.`;
  return (
    <>
      <NextSeo
        title={title}
        description={description}
        openGraph={{
          title,
          description,
          images: [
            {
              url: spot.images[0]
                ? toCloudinaryUrl(spot.images[0].key, 800)
                : `${siteConfig.baseUrl}/wings.webp`,
              width: 800,
              height: 800,
              alt: `${name} wings`,
            },
          ],
        }}
      />
      <Layout title={`${name} - Naked Extra Crispy`}>
        <h1>{spot.name}</h1>
        <Space size="md" />
        <Card>
          <ImageDisplay
            imageKeys={spot.images.map((image) => image.key)}
            priority
          />
          <Card.Body
            css={`
              justify-content: space-between;
            `}
          >
            <div>
              <div
                css={`
                  ${row}
                `}
              >
                <p>
                  {spot.city}, {spot.state}
                </p>
                {spot.place && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${spot.place.name}&query_place_id=${spot.place.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📍
                  </a>
                )}
              </div>
              {spot.numWings > 0 && (
                <p>{spot.numWings.toLocaleString()} wings</p>
              )}
              <Space size="sm" />
              {spot.rating ? (
                <Rating displayValue={spot.rating} />
              ) : (
                <span>🚫 No wings</span>
              )}
            </div>
            <div
              css={`
                ${col}
              `}
            >
              <Link href={`#results`}>
                <button>Show me the wings</button>
              </Link>
              <Link href={`/spots/${spotId}/addWing`}>
                <button>+ Add Wing</button>
              </Link>
            </div>
          </Card.Body>
        </Card>
        <Space size="md" />
        <h2>Wings</h2>
        <Space size="sm" />
        <WingsDisplay wings={wings} />
      </Layout>
    </>
  );
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });
  const spotId = context.params?.id as string;
  await ssg.public.getSpot.prefetch({ spotId });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: spotId,
    },
    revalidate: 1,
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const spots = await prisma.spot.findMany({
    select: {
      id: true,
    },
  });
  return {
    paths: spots.map((spot) => ({
      params: {
        id: spot.id,
      },
    })),
    fallback: "blocking",
  };
};

export default Spot;
