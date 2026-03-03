import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import React from "react";
import { trpc } from "../../../utils/trpc";
import Error from "next/error";
import { Loading } from "../../../components/Loading";
import Link from "next/link";
import { Layout } from "../../../components/Layout";
import { ImageDisplay } from "../../../components/ImageDisplay";
import { Card } from "../../../components/Card";
import { WingsDisplay } from "../../../components/WingsDisplay";
import { LocalBusinessJsonLd } from "next-seo";
import { toCloudinaryUrl } from "../../../lib/cloudinary";
import { siteConfig } from "../../../siteConfig";
import { prisma } from "../../../server/db/client";
import { appRouter } from "../../../server/trpc/router/_app";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { createContextInner } from "../../../server/trpc/context";
import superjson from "superjson";
import { env } from "../../../env/client.mjs";
import { RatingDisplay } from "../../../components/RatingDisplay";
import { NextSeo } from "../../../components/Seo";
import { Button } from "@/components/ui/button";

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
  const geo = spot.place
    ? {
        latitude: spot.place.lat,
        longitude: spot.place.lng,
      }
    : undefined;
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
        name={name}
        description={description}
        url={url}
        address={{
          addressCountry: "US",
          addressLocality: spot.place?.city,
          addressRegion: spot.place?.state,
        }}
        {...(geo ? { geo } : {})}
        image={spot.images.map((image) => toCloudinaryUrl(image.key, 800))}
        aggregateRating={{
          ratingValue: spot.rating,
          ratingCount: spot.numWings,
        }}
        review={spot.wings.map((rating) => ({
          author: rating.user.name ?? "Anonymous",
          datePublished: rating.createdAt.toLocaleDateString(),
          reviewBody: rating.review,
          reviewRating: {
            bestRating: "10",
            worstRating: "1",
            ratingValue: rating.rating,
          },
        }))}
        servesCuisine={["Chicken Wings", "Buffalo Wings"]}
      />
      <Layout title={`${name} - Naked Extra Crispy`}>
        <h1 className="text-3xl font-black">{spot.name}</h1>
        <div className="h-8" />
        <Card>
          <ImageDisplay
            imageKeys={spot.images.map((image) => image.key)}
            priority
          />
          <Card.Body className="justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-muted-foreground">
                  {spot.city}, {spot.state}
                </p>
                {spot.place && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${spot.place.name}&query_place_id=${spot.place.id}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${spot.name} in Google Maps`}
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
                <p className="text-sm text-muted-foreground">
                  {spot.numWings.toLocaleString()} ratings
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Button asChild>
                <Link href={`#results`}>Show me the wings</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/spots/${spotId}/addWing`}>+ Add rating</Link>
              </Button>
            </div>
          </Card.Body>
        </Card>
        <div className="h-8" />
        <h2 className="text-2xl font-semibold">Wings</h2>
        <div className="h-4" />
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
    revalidate: siteConfig.revalidate,
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
