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
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Layout } from "../../components/Layout";
import { WingDisplay } from "../../components/WingDisplay";
import { ArticleJsonLd } from "next-seo";
import { toCloudinaryUrl } from "../../lib/cloudinary";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "../../server/trpc/router/_app";
import { createContextInner } from "../../server/trpc/context";
import { prisma } from "../../server/db/client";
import superjson from "superjson";
import { env } from "../../env/client.mjs";
import { siteConfig } from "../../siteConfig";
import { NextSeo } from "../../components/Seo";
import { Button } from "@/components/ui/button";

const Wing = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { id: wingId } = props;
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: session } = useSession();
  const { data: wing, isLoading } = trpc.public.getWing.useQuery({ wingId });
  const deleteWing = trpc.auth.deleteWing.useMutation();
  if (isLoading) {
    return <Loading />;
  }
  if (!wing) {
    return <Error statusCode={404} />;
  }
  const isCreator = session?.user?.id === wing.user.id;
  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "Delete this rating? This can't be undone."
    );
    if (!shouldDelete) {
      return;
    }
    try {
      const deletedWing = await deleteWing.mutateAsync({ wingId: wing.id });
      void utils.public.getAllWings.invalidate();
      void utils.public.getSpot.invalidate({ spotId: deletedWing.spotId });
      void router.push(`/spots/${deletedWing.spotId}`);
    } catch {
      // Ignore and keep the button available for retry.
    }
  };
  const { spot } = wing;
  const title = `${wing.spot.name} wing review - ${wing.rating}/10`;
  const description = `${wing.review}`;
  const url = `${env.NEXT_PUBLIC_BASE_URL}/wings/${wing.id}`;
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
                : `${env.NEXT_PUBLIC_BASE_URL}/wings.webp`,
              width: 800,
              height: 800,
              alt: `${spot.name} wings`,
            },
          ],
        }}
      />
      <ArticleJsonLd
        url={url}
        headline={title}
        image={wing.images.map((image) => {
          return toCloudinaryUrl(image.key, 800);
        })}
        datePublished={wing.createdAt.toISOString()}
        author={[
          {
            name: wing.user.name ?? "Anonymous",
          },
        ]}
        publisher={{
          name: "Makon Cline",
          logo: env.NEXT_PUBLIC_BASE_URL + "/logo.webp",
        }}
        description={description}
        isAccessibleForFree={true}
      />
      <Layout>
        <h1 className="text-3xl font-black">{spot.name}</h1>
        <div className="h-4" />
        <Button asChild>
          <Link href={`/spots/${spot.id}`}>View spot</Link>
        </Button>
        <div className="h-8" />
        <WingDisplay wing={wing} />
        <div className="h-8" />
        {isCreator && (
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleDelete}
              variant="ghost"
              disabled={deleteWing.isPending}
              className="h-auto p-0 text-xs text-muted-foreground underline underline-offset-2"
            >
              {deleteWing.isPending ? "Deleting rating..." : "Delete rating"}
            </Button>
          </div>
        )}
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
  const wingId = context.params?.id as string;
  await ssg.public.getWing.prefetch({ wingId });
  return {
    props: {
      trpcState: ssg.dehydrate(),
      id: wingId,
    },
    revalidate: siteConfig.revalidate,
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
