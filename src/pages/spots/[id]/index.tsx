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
import { LocalBusinessJsonLd, NextSeo } from "next-seo";
import { toCloudinaryUrl } from "../../../lib/cloudinary";
import { siteConfig } from "../../../siteConfig";
import { prisma } from "../../../server/db/client";
import { appRouter } from "../../../server/trpc/router/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { createContextInner } from "../../../server/trpc/context";
import superjson from "superjson";
import { env } from "../../../env/client.mjs";
import { getRatingDescription } from "../../../lib/getRatingDescription";
import { RatingDisplay } from "../../../components/RatingDisplay";

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
  const url = `${env.NEXT_PUBLIC_BASE_URL}/spots/${spotId}`;
  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{
          url,
          title,
          description,
          images: [
            {
              url: spot.images[0]
                ? toCloudinaryUrl(spot.images[0].key, 800)
                : `${env.NEXT_PUBLIC_BASE_URL}/wings.webp`,
              width: 800,
              height: 800,
              alt: `${name} wings`,
            },
          ],
        }}
      />
      <LocalBusinessJsonLd
        type="Restaurant"
        id={url}
        name={name}
        description={description}
        url={url}
        address={{
          addressCountry: "US",
          addressLocality: spot.place?.city,
          addressRegion: spot.place?.state,
        }}
        geo={{
          latitude: spot.place?.lat,
          longitude: spot.place?.lng,
        }}
        images={spot.images.map((image) => toCloudinaryUrl(image.key, 800))}
        rating={{
          ratingValue: spot.rating,
          ratingCount: spot.numWings,
        }}
        review={spot.wings.map((rating) => ({
          author: rating.user.name,
          datePublished: rating.createdAt.toLocaleDateString(),
          reviewBody: rating.review,
          reviewRating: {
            bestRating: "10",
            worstRating: "1",
            ratingValue: rating.rating,
          },
        }))}
        servesCuisine={["Chicken Wings", "Buffalo Wings"]}
        action={{
          actionName: "Add a review",
          actionType: "ReviewAction",
          target: `${url}/addWing`,
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
              {spot.rating ? (
                <RatingDisplay rating={spot.rating} />
              ) : (
                <span>🚫 No ratings</span>
              )}
              {spot.numWings > 0 && (
                <p>{spot.numWings.toLocaleString()} ratings</p>
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
                <button>+ Add rating</button>
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
  const ssg = createServerSideHelpers({
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
