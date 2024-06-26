import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import React from "react";
import { Layout } from "../components/Layout";
import { Space } from "../components/Space";
import { Loading } from "../components/Loading";

import { createServerSideHelpers } from "@trpc/react-query/server";
import { createContextInner } from "../server/trpc/context";
import { appRouter } from "../server/trpc/router/_app";
import superjson from "superjson";
import { MapDisplay } from "../components/MapDisplay";
import { siteConfig } from "../siteConfig";

const Map: NextPage = () => {
  const { data: spots, status } = trpc.public.getAllSpots.useQuery();
  const isLoading = status === "loading";
  return (
    <Layout>
      <h1>Wing Map</h1>
      <Space size="sm" />
      {isLoading ? <Loading /> : <MapDisplay spots={spots} />}
    </Layout>
  );
};

export async function getStaticProps() {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });
  await ssg.public.getAllSpots.prefetch();
  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: siteConfig.revalidate,
  };
}

export default Map;
