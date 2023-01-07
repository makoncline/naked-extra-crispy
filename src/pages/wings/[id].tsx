import type { NextPage } from "next";
import React from "react";
import { trpc } from "../../utils/trpc";
import { useRouter } from "next/router";
import Error from "next/error";
import { Loading } from "../../components/Loading";
import Link from "next/link";
import { Layout } from "../../components/Layout";
import { Space } from "../../components/Space";
import { WingDisplay } from "../../components/WingDisplay";
import { NextSeo } from "next-seo";
import { toCloudinaryUrl } from "../../lib/cloudinary";
import { siteConfig } from "../../siteConfig";

const Wing: NextPage = () => {
  const router = useRouter();
  const wingId = router.query.id as string;
  const { data: wing, isLoading } = trpc.public.getWing.useQuery({ wingId });
  if (isLoading) {
    return <Loading />;
  }
  if (!wing) {
    return <Error statusCode={404} />;
  }
  const { spot } = wing;
  return (
    <>
      <NextSeo
        title={`${wing.spot.name} - Naked Extra Crispy`}
        description={`Rating: ${wing.rating}/10\nReview:${wing.review}`}
        openGraph={{
          title: `${wing.spot.name} - Naked Extra Crispy`,
          description: `Rating: ${wing.rating}/10\nReview:${wing.review}`,
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

export default Wing;
