import React from "react";
import { trpc } from "../utils/trpc";
import Error from "next/error";
import { Loading } from "../components/Loading";
import { Layout } from "../components/Layout";
import { Space } from "../components/Space";
import { NextSeo } from "next-seo";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "../server/trpc/router/_app";
import { createContextInner } from "../server/trpc/context";
import superjson from "superjson";
import { env } from "../env/client.mjs";
import { WingsDisplay } from "../components/WingsDisplay";

const Wings = () => {
  const { data: wings, isLoading } = trpc.public.getAllWings.useQuery();
  if (isLoading) {
    return <Loading />;
  }
  if (!wings) {
    return <Error statusCode={404} />;
  }
  const title = `Buffalo wing reviews`;
  const description = `View all buffalo wing reviews`;
  const url = `${env.NEXT_PUBLIC_BASE_URL}/ratings`;
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
        }}
      />
      <Layout>
        <h1>Wings</h1>
        <Space size="sm" />
        <WingsDisplay wings={wings} showSpotName={true} />
      </Layout>
    </>
  );
};

export async function getStaticProps() {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });
  await ssg.public.getAllWings.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: 1,
  };
}

export default Wings;
