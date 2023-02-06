import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import React from "react";
import { trpc } from "../../utils/trpc";
import Error from "next/error";
import { Loading } from "../../components/Loading";
import Link from "next/link";
import { Layout } from "../../components/Layout";
import { Space } from "../../components/Space";
import { WingDisplay } from "../../components/WingDisplay";
import { ArticleJsonLd, NextSeo } from "next-seo";
import { toCloudinaryUrl } from "../../lib/cloudinary";
import { siteConfig } from "../../siteConfig";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "../../server/trpc/router/_app";
import { createContextInner } from "../../server/trpc/context";
import { prisma } from "../../server/db/client";
import superjson from "superjson";

const Wing = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { id: wingId } = props;
  const { data: wing, isLoading } = trpc.public.getWing.useQuery({ wingId });
  if (isLoading) {
    return <Loading />;
  }
  if (!wing) {
    return <Error statusCode={404} />;
  }
  const { spot } = wing;
  const title = `${wing.spot.name} wing review - ${wing.rating}/10`;
  const description = `${wing.review}`;
  const url = `${siteConfig.baseUrl}/wings/${wing.id}`;
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
              url: wing.images[0]
                ? toCloudinaryUrl(wing.images[0].key, 800)
                : `${siteConfig.baseUrl}/wings.webp`,
              width: 800,
              height: 800,
              alt: `${spot.name} wings`,
            },
          ],
        }}
      />
      <ArticleJsonLd
        url={url}
        title={title}
        images={wing.images.map((image) => {
          return toCloudinaryUrl(image.key, 800);
        })}
        datePublished={wing.createdAt.toLocaleDateString()}
        authorName={[
          {
            name: wing.user.name,
          },
        ]}
        publisherName="Makon Cline"
        publisherLogo={siteConfig.baseUrl + "/logo.webp"}
        description={description}
        isAccessibleForFree={true}
      />
      <Layout>
        <h1>{spot.name}</h1>
        <Space size="sm" />
        <div>
          <Link href={`/spots/${spot.id}`}>
            <button>View spot</button>
          </Link>
        </div>
        <Space size="md" />
        <WingDisplay wing={wing} />
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
  const wingId = context.params?.id as string;
  await ssg.public.getWing.prefetch({ wingId });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: wingId,
    },
    revalidate: 1,
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const wings = await prisma.wing.findMany({
    select: {
      id: true,
    },
  });
  return {
    paths: wings.map((wing) => ({
      params: {
        id: wing.id,
      },
    })),
    fallback: "blocking",
  };
};

export default Wing;
